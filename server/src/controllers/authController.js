import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { UserModel } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'readydocs_dev_jwt_secret_fallback_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token
 * @param {Object} user
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const AuthController = {
  /**
   * POST /api/auth/register
   * Create a new user with name, email, and password
   */
  async register(req, res) {
    try {
      // 1. Zod Validation
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const { name, email, password } = parseResult.data;

      // 2. Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A user with this email address already exists.'
        });
      }

      // 3. Hash password with bcryptjs
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 4. Save to database (Supabase users table)
      const newUser = await UserModel.create({
        name,
        email,
        passwordHash
      });

      // 5. Generate JWT token
      const token = generateToken(newUser);

      // 6. Return response (no passwords or hashes exposed)
      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.created_at
        }
      });
    } catch (err) {
      if (err.status === 409) {
        return res.status(409).json({
          error: 'Conflict',
          message: err.message
        });
      }

      console.error('[Register Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Registration failed due to a server error.'
      });
    }
  },

  /**
   * POST /api/auth/login
   * Login with email and password and return a JWT token
   */
  async login(req, res) {
    try {
      // 1. Zod Validation
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const { email, password } = parseResult.data;

      // 2. Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password.'
        });
      }

      // 3. Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password.'
        });
      }

      // 4. Generate JWT
      const token = generateToken(user);

      // 5. Return success response (never expose password_hash)
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        }
      });
    } catch (err) {
      console.error('[Login Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed due to a server error.'
      });
    }
  },

  /**
   * POST /api/auth/logout
   * Logout endpoint (allows client to signal session invalidation)
   */
  async logout(req, res) {
    try {
      return res.status(200).json({
        message: 'Logged out successfully'
      });
    } catch (err) {
      console.error('[Logout Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Logout failed due to a server error.'
      });
    }
  },

  /**
   * GET /api/auth/me
   * Return the logged-in user's basic details using the JWT
   */
  async getMe(req, res) {
    try {
      // req.user is set by requireAuth middleware
      return res.status(200).json({
        user: req.user
      });
    } catch (err) {
      console.error('[GetMe Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile.'
      });
    }
  }
};
