import { TodoModel as TodoSequelizeModel } from '../models/todo.sequelize';
import { CreateTodoDto, UpdateTodoStatusDto, TodoStatus } from '../types/todo.types';

export class TodoRepository {
  async create(createTodoDto: CreateTodoDto) {
    const todo = await TodoSequelizeModel.create({
      userId: createTodoDto.userId,
      title: createTodoDto.title,
      description: createTodoDto.description || '',
      status: TodoStatus.PENDING,
    });
    return todo.toJSON();
  }

  async findById(todoId: string) {
    const todo = await TodoSequelizeModel.findByPk(todoId);
    return todo ? todo.toJSON() : null;
  }

  async findByUserId(userId: string) {
    const todos = await TodoSequelizeModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    return todos.map((todo) => todo.toJSON());
  }

  async updateStatus(todoId: string, userId: string, status: TodoStatus) {
    const [affectedRows] = await TodoSequelizeModel.update(
      { status },
      {
        where: {
          id: todoId,
          userId: userId,
        },
      },
    );

    if (affectedRows === 0) {
      return null;
    }

    const todo = await this.findById(todoId);
    return todo;
  }

  async delete(todoId: string, userId: string): Promise<boolean> {
    const deletedRows = await TodoSequelizeModel.destroy({
      where: {
        id: todoId,
        userId: userId,
      },
    });

    return deletedRows > 0;
  }
}

export const todoRepository = new TodoRepository();



