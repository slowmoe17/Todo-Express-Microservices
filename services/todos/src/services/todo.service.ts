import { todoRepository } from '../repositories/todo.repository';
import { CreateTodoDto, UpdateTodoStatusDto, TodoStatus, TodoWithUser } from '../types/todo.types';
import { userGrpcClient } from '../clients/user.grpc.client';
import { todoStatusPublisher } from '../clients/rabbitmq.publisher';

export class TodoService {
  async createTodo(createTodoDto: CreateTodoDto): Promise<TodoWithUser> {
    // Business logic: Get user data via gRPC
    const userData = await userGrpcClient.getUserById(createTodoDto.userId);
    if (!userData.success) {
      throw new Error('User not found');
    }

    // Repository: Create todo in database
    const todo = await todoRepository.create(createTodoDto);
    
    // Map todo to include user data
    const todoWithUser: TodoWithUser = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    };
    
    return todoWithUser;
  }

  async getTodosByUserId(userId: string): Promise<TodoWithUser[]> {
    // Business logic: Get user data via gRPC
    const userData = await userGrpcClient.getUserById(userId);
    if (!userData.success) {
      throw new Error('User not found');
    }

    // Repository: Get todos from database
    const todos = await todoRepository.findByUserId(userId);
    
    // Map todos to include user data
    const todosWithUser: TodoWithUser[] = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    }));
    
    return todosWithUser;
  }

  async updateTodoStatus(updateTodoStatusDto: UpdateTodoStatusDto): Promise<TodoWithUser> {
    // Business logic: Get user data via gRPC
    const userData = await userGrpcClient.getUserById(updateTodoStatusDto.userId);
    if (!userData.success) {
      throw new Error('User not found');
    }

    // Business logic: Validate status
    if (!Object.values(TodoStatus).includes(updateTodoStatusDto.status)) {
      throw new Error('Invalid status');
    }

    // Repository: Update todo status
    const todo = await todoRepository.updateStatus(
      updateTodoStatusDto.todoId,
      updateTodoStatusDto.userId,
      updateTodoStatusDto.status,
    );

    if (!todo) {
      throw new Error('Todo not found or access denied');
    }

    // Publish status update to RabbitMQ queue
    try {
      await todoStatusPublisher.publishStatusUpdate({
        todoId: todo.id,
        userId: updateTodoStatusDto.userId,
        status: todo.status,
        updatedAt: todo.updatedAt instanceof Date ? todo.updatedAt.toISOString() : new Date(todo.updatedAt).toISOString(),
      });
    } catch (error) {
      // Log error but don't fail the request if publishing fails
      console.error('Failed to publish status update to RabbitMQ:', error);
    }

    // Map todo to include user data
    const todoWithUser: TodoWithUser = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    };

    return todoWithUser;
  }

  async deleteTodo(todoId: string, userId: string) {
    // Business logic: Validate user exists via gRPC
    const userValidation = await userGrpcClient.validateUser(userId);
    if (!userValidation.success) {
      throw new Error('User not found');
    }

    // Repository: Delete todo
    const deleted = await todoRepository.delete(todoId, userId);
    if (!deleted) {
      throw new Error('Todo not found or access denied');
    }

    return { success: true };
  }
}

export const todoService = new TodoService();
