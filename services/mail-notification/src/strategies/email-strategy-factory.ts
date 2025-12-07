import { EmailStrategy } from './email-strategy.interface';
import { PendingStatusStrategy } from './pending-status-strategy';
import { InProgressStatusStrategy } from './in-progress-status-strategy';
import { CompletedStatusStrategy } from './completed-status-strategy';
import { TodoStatus } from '../types/todo.types';

export class EmailStrategyFactory {
  private strategies: Map<TodoStatus, EmailStrategy>;

  constructor() {
    this.strategies = new Map();
    this.strategies.set(TodoStatus.PENDING, new PendingStatusStrategy());
    this.strategies.set(TodoStatus.IN_PROGRESS, new InProgressStatusStrategy());
    this.strategies.set(TodoStatus.COMPLETED, new CompletedStatusStrategy());
  }

  getStrategy(status: TodoStatus): EmailStrategy {
    const strategy = this.strategies.get(status);
    if (!strategy) {
      throw new Error(`No email strategy found for status: ${status}`);
    }
    return strategy;
  }
}

export const emailStrategyFactory = new EmailStrategyFactory();



