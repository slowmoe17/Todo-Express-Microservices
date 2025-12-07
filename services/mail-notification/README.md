# Mail Notification Service

Microservice for sending email notifications based on RabbitMQ events.

## Features

- Consumes task status update events from RabbitMQ
- Uses Strategy Design Pattern for different email types
- Supports multiple task statuses (pending, in_progress, completed)
- Easily extensible for new email types

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```env
# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE_NAME=todo_exchange
RABBITMQ_TODO_STATUS_QUEUE=todo_status_updates
RABBITMQ_TODO_STATUS_ROUTING_KEY=todo.status.update

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com

# Default user email (for testing - should be fetched from user service in production)
DEFAULT_USER_EMAIL=test@example.com

# Service Port
PORT=3003
```

3. Run the service:
```bash
npm run dev
```

## Architecture

### Strategy Pattern

The service uses the Strategy Design Pattern to handle different email types:

- `EmailStrategy` interface - defines the contract for email strategies
- `BaseEmailStrategy` - base class with common functionality
- Specific strategies:
  - `PendingStatusStrategy` - for pending task status
  - `InProgressStatusStrategy` - for in-progress task status
  - `CompletedStatusStrategy` - for completed task status

### RabbitMQ Consumer

- Consumes messages from `todo_status_updates` queue
- Processes task status update events
- Uses appropriate email strategy based on status
- Acknowledges messages after successful processing

## Adding New Email Strategies

1. Create a new strategy class extending `BaseEmailStrategy`
2. Implement `getSubject()` and `getHtmlContent()` methods
3. Register the strategy in `EmailStrategyFactory`

Example:
```typescript
export class NewStatusStrategy extends BaseEmailStrategy {
  getSubject(context: EmailContext): string {
    return `Your task status changed`;
  }

  getHtmlContent(context: EmailContext): string {
    return `<html>...</html>`;
  }
}
```

## Future Improvements

- Fetch user email and name from user service
- Fetch todo title from todo service
- Add email templates with better styling
- Add retry mechanism for failed emails
- Add email delivery tracking



