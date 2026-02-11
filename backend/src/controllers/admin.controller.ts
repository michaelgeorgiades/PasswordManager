import { Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/db';
import { AuditService } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler.middleware';

export class AdminController {
  /**
   * Get all users (admin only)
   */
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);

      // Get users
      const result = await query(
        `SELECT id, username, email, role, is_active, created_by, created_at, updated_at, last_login
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        success: true,
        data: {
          data: result.rows,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw new AppError('Failed to get users', 500);
    }
  }

  /**
   * Create a new user (admin only)
   */
  static async createUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { username, email, password, role } = req.body;

      // Validate role
      if (!['admin', 'user'].includes(role)) {
        throw new AppError('Invalid role', 400);
      }

      // Check if username or email already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Username or email already exists', 400);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const result = await query(
        `INSERT INTO users (username, email, password_hash, role, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, role, is_active, created_by, created_at, updated_at`,
        [username, email, passwordHash, role, req.user.userId]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Create user error:', error);
      throw new AppError('Failed to create user', 500);
    }
  }

  /**
   * Update a user (admin only)
   */
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, password, role, is_active } = req.body;

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (username !== undefined) {
        updates.push(`username = $${paramIndex++}`);
        values.push(username);
      }

      if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }

      if (password !== undefined) {
        const passwordHash = await bcrypt.hash(password, 12);
        updates.push(`password_hash = $${paramIndex++}`);
        values.push(passwordHash);
      }

      if (role !== undefined) {
        if (!['admin', 'user'].includes(role)) {
          throw new AppError('Invalid role', 400);
        }
        updates.push(`role = $${paramIndex++}`);
        values.push(role);
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(is_active);
      }

      if (updates.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      values.push(id);

      const result = await query(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, username, email, role, is_active, created_by, created_at, updated_at`,
        values
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
      console.error('Update user error:', error);
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete a user (admin only)
   */
  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Don't allow deleting self
      if (req.user?.userId === id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Delete user error:', error);
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Get access logs (admin only)
   */
  static async getAccessLogs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const passwordId = req.query.passwordId as string;
      const userId = req.query.userId as string;
      const accessType = req.query.accessType as any;

      const logs = await AuditService.getAccessLogs({
        page,
        limit,
        passwordId,
        userId,
        accessType,
      });

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      throw new AppError('Failed to get access logs', 500);
    }
  }

  /**
   * Get statistics (admin only)
   */
  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const stats = await AuditService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      throw new AppError('Failed to get statistics', 500);
    }
  }
}
