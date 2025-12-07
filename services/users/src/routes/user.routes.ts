import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

router.post('/register', (req, res) => userController.createUser(req, res));
router.post('/login', (req, res) => userController.login(req, res));

export default router;

