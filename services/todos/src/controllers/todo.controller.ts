import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { todoService } from '../services/todo.service';
import { TodoStatus } from '../types/todo.types';

export class TodoController {
  async createTodo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description } = req.body;
      const userId = req.userId!;

      if (!title) {
        res.status(400).json({
          success: false,
          message: 'Title is required',
        });
        return;
      }

      const todo = await todoService.createTodo({
        userId,
        title,
        description: description || '',
      });

      res.status(201).json({
        success: true,
        message: 'Todo created successfully',
        data: todo,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create todo',
      });
    }
  }

  async getTodos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const todos = await todoService.getTodosByUserId(userId);
      res.status(200).json({
        success: true,
        message: 'Todos retrieved successfully',
        data: todos,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve todos',
      });
    }
  }

  async updateTodoStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { todoId } = req.params;
      const { status } = req.body;
      const userId = req.userId!;

      if (!status || !Object.values(TodoStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Valid status is required (pending, in_progress, completed)',
        });
        return;
      }

      const todo = await todoService.updateTodoStatus({
        todoId,
        userId,
        status: status as TodoStatus,
      });

      res.status(200).json({
        success: true,
        message: 'Todo status updated successfully',
        data: todo,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update todo status',
      });
    }
  }

  async deleteTodo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { todoId } = req.params;
      const userId = req.userId!;

      await todoService.deleteTodo(todoId, userId);

      res.status(200).json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete todo',
      });
    }
  }
}

export const todoController = new TodoController();



