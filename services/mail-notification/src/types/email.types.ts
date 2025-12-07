export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailContext {
  todoId: string;
  userId: string;
  status: string;
  updatedAt: string;
  userEmail?: string;
  userName?: string;
  todoTitle?: string;
}



