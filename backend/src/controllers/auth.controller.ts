import { Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/db';
import { JWTService } from '../services/jwt.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler.middleware';

export class AuthController {
  /**
   * User login
   */
  static async login(req: AuthRequest, res: Response) {
    try {
      const { username, password } = req.body;

      // Find user
      const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new AppError('Account is deactivated', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = JWTService.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      // Return user data (without password hash)
      const { password_hash, ...userData } = user;

      res.json({
        success: true,
        data: {
          token,
          user: userData,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const result = await query(
        'SELECT id, username, email, role, is_active, created_at, updated_at, last_login FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user info', 500);
    }
  }

  /**
   * Logout (client-side token removal)
   */
  static async logout(req: AuthRequest, res: Response) {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
