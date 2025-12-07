import { Request, Response, NextFunction } from 'express';
import { userGrpcClient } from '../clients/user.grpc.client';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Auth middleware that extracts user ID from X-User-Id header set by nginx
 * after JWT validation. Optionally validates user exists via gRPC for extra security.
 * 
 * Note: JWT validation is handled by nginx gateway, so this middleware
 * only needs to extract the user ID and optionally validate user existence.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract user ID from header set by nginx after JWT validation
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in request',
      });
      return;
    }

    // Optional: Validate user still exists via gRPC (for extra security)
    // This ensures user wasn't deleted between JWT validation and request processing
    const userValidation = await userGrpcClient.validateUser(userId);
    if (!userValidation.success) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    req.userId = userId;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed',
    });
  }
}



