import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Generate JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, userType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists' 
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password,
      userType: userType || 'staff'
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          userType: user.userType
        },
        token: generateToken((user._id as any).toString())
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Login user (Mobile app version)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, userType } = req.body;

    // Handle mobile app login (username + userType)
    if (username && userType) {
      // Find user by username and userType
      const user = await User.findOne({ 
        username: username.toLowerCase(),
        userType,
        isActive: true 
      }).select('+password');

      if (!user) {
        res.status(401).json({ 
          success: false,
          userType,
          message: 'Invalid credentials' 
        });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ 
          success: false,
          userType,
          message: 'Invalid credentials' 
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        userType: user.userType,
        message: 'Login successful',
        token: generateToken((user._id as any).toString()),
        user: {
          id: user._id,
          username: user.username,
          userType: user.userType,
          name: user.name
        }
      });
      return;
    }

    // Handle web app login (email + password)
    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      },
      token: generateToken((user._id as any).toString())
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Validate session
// @route   GET /api/auth/validate
// @access  Private
export const validateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(401).json({ 
        valid: false, 
        message: 'User not found' 
      });
      return;
    }

    res.json({ 
      valid: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        username: user.username,
        email: user.email, 
        userType: user.userType 
      } 
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(401).json({ 
      valid: false, 
      message: 'Invalid token' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Setup sample users
// @route   POST /api/auth/setup-sample-users
// @access  Public
export const setupSampleUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if sample users already exist
    const existingUsers = await User.find({
      $or: [
        { username: 'admin' },
        { username: 'chef' }
      ]
    });

    if (existingUsers.length > 0) {
      res.json({ 
        success: true,
        message: 'Sample users already exist' 
      });
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        name: 'Administrator',
        username: 'admin',
        email: 'admin@shop.com',
        password: 'admin123',
        userType: 'admin'
      },
      {
        name: 'Kitchen Chef',
        username: 'chef',
        email: 'chef@shop.com',
        password: 'chef123',
        userType: 'chef'
      }
    ];

    const createdUsers = await User.create(sampleUsers);

    res.status(201).json({
      success: true,
      message: 'Sample users created successfully',
      users: createdUsers.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        userType: user.userType
      }))
    });
  } catch (error) {
    console.error('Setup sample users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
}; 