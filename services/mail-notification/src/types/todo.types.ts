export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface TodoStatusUpdateMessage {
  todoId: string;
  userId: string;
  status: TodoStatus;
  updatedAt: string;
}



