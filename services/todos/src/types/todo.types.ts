export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
}

export interface TodoWithUser extends Omit<Todo, 'userId'> {
  user: UserData;
}

export interface CreateTodoDto {
  userId: string;
  title: string;
  description: string;
}

export interface UpdateTodoStatusDto {
  todoId: string;
  userId: string;
  status: TodoStatus;
}

