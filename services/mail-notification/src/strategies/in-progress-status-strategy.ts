import { BaseEmailStrategy } from './base-email-strategy';
import { EmailContext } from '../types/email.types';

export class InProgressStatusStrategy extends BaseEmailStrategy {
  getSubject(context: EmailContext): string {
    return `Task "${context.todoTitle || 'Untitled'}" is now In Progress`;
  }

  getHtmlContent(context: EmailContext): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e3f2fd; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; }
            .status-badge { display: inline-block; padding: 5px 15px; background-color: #2196f3; color: #fff; border-radius: 3px; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Task Status Update</h2>
            </div>
            <div class="content">
              <p>Hello ${context.userName || 'User'},</p>
              <p>Great news! Your task <strong>"${context.todoTitle || 'Untitled'}"</strong> is now <span class="status-badge">IN PROGRESS</span>.</p>
              <p>You've started working on this task. Keep up the momentum and make steady progress!</p>
              <p><strong>Task ID:</strong> ${context.todoId}</p>
              <p><strong>Updated at:</strong> ${new Date(context.updatedAt).toLocaleString()}</p>
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



