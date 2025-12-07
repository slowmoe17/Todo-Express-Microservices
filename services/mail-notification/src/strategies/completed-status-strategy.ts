import { BaseEmailStrategy } from './base-email-strategy';
import { EmailContext } from '../types/email.types';

export class CompletedStatusStrategy extends BaseEmailStrategy {
  getSubject(context: EmailContext): string {
    return `🎉 Task "${context.todoTitle || 'Untitled'}" Completed!`;
  }

  getHtmlContent(context: EmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e8f5e9; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; }
            .status-badge { display: inline-block; padding: 5px 15px; background-color: #4caf50; color: #fff; border-radius: 3px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 Task Completed!</h2>
            </div>
            <div class="content">
              <p>Hello ${context.userName || 'User'},</p>
              <p>Congratulations! You've successfully completed your task <strong>"${context.todoTitle || 'Untitled'}"</strong>.</p>
              <p>The task status has been updated to <span class="status-badge">COMPLETED</span>.</p>
              <p>Well done on finishing this task! Keep up the excellent work!</p>
              <p><strong>Task ID:</strong> ${context.todoId}</p>
              <p><strong>Completed at:</strong> ${new Date(context.updatedAt).toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from Todo Service.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}



