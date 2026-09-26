import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from './auth.validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: result
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => err.message);
        res.status(400).json({
          success: false,
          message: errorMessages[0],
          errors: errorMessages
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed.'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error: any) {
      // Excalidraw requirement: Invalid credentials must return "Invalid Login Id or Password"
      res.status(401).json({
        success: false,
        message: error.message === 'Invalid Login Id or Password' 
          ? 'Invalid Login Id or Password' 
          : (error.message || 'Authentication failed')
      });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.requestPasswordReset(validatedData.emailOrLoginId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Password reset request failed.'
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(validatedData);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: error.errors[0].message
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Password reset failed.'
      });
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const profile = await AuthService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Profile not found.'
      });
    }
  }
}
