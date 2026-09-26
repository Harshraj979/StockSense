import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { RegisterInput, LoginInput, ResetPasswordInput } from './auth.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_jwt_secure_secret_key_2026_modular';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  /**
   * Register a new user with strict database validations
   */
  static async register(input: RegisterInput) {
    // 1. Check if Login ID is already taken
    const existingLoginId = await prisma.user.findUnique({
      where: { loginId: input.loginId }
    });
    if (existingLoginId) {
      throw new Error('This Login Id is already taken. Please choose another.');
    }

    // 2. Check if Email is already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() }
    });
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // 4. Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        loginId: input.loginId,
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role || 'STAFF',
        passwordHash
      },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // 5. Generate session token
    const token = jwt.sign(
      { id: user.id, loginId: user.loginId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  /**
   * Authenticate user.
   * Requirement: Return exact message "Invalid Login Id or Password" on failure.
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { loginId: input.loginId }
    });

    if (!user) {
      throw new Error('Invalid Login Id or Password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid Login Id or Password');
    }

    const token = jwt.sign(
      { id: user.id, loginId: user.loginId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Generate 6-digit OTP for password reset
   */
  static async requestPasswordReset(emailOrLoginId: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrLoginId.toLowerCase() },
          { loginId: emailOrLoginId }
        ]
      }
    });

    if (!user) {
      throw new Error('No account found associated with that Login Id or Email.');
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt
      }
    });

    console.log(`[AUTH LOG] OTP for user ${user.loginId} (${user.email}): ${otp}`);

    return {
      message: 'Password reset OTP has been generated successfully.',
      email: user.email,
      loginId: user.loginId,
      // For developer demonstration and immediate testing convenience, we return the OTP in response
      demoOtp: otp,
      expiresInMinutes: 10
    };
  }

  /**
   * Verify OTP and reset password
   */
  static async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.emailOrLoginId.toLowerCase() },
          { loginId: input.emailOrLoginId }
        ]
      }
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new Error('Invalid or expired password reset request. Please request a new OTP.');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new Error('This OTP has expired. Please request a new one.');
    }

    if (user.otpCode !== input.otp) {
      throw new Error('Invalid OTP code. Please enter the 6-digit code sent to your account.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null
      }
    });

    return {
      message: 'Password reset successfully. You can now login with your new password.'
    };
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User profile not found.');
    }

    return user;
  }
}
