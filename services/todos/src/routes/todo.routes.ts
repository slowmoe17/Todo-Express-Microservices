import { Router } from 'express';
import { todoController } from '../controllers/todo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => todoController.createTodo(req as any, res));
router.get('/', (req, res) => todoController.getTodos(req as any, res));
router.patch('/:todoId/status', (req, res) => todoController.updateTodoStatus(req as any, res));
router.delete('/:todoId', (req, res) => todoController.deleteTodo(req as any, res));

export default router;



