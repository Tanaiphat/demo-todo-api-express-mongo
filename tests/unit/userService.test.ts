import { UserService } from '../../src/services/userService';
import { db } from '../../src/config/db';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/config/db', () => ({
  db: {
    users: {
      findOne: jest.fn(),
      insertOne: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-for-jwt-testing-32chars',
    JWT_EXPIRES_IN: '7d',
  },
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const mockId = new ObjectId();
      const hashedPassword = 'hashed_password_123';

      (db.users.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (db.users.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockId });

      const result = await UserService.register(registerData);

      expect(db.users.findOne).toHaveBeenCalledWith({ email: registerData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(db.users.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerData.email,
          password: hashedPassword,
          name: registerData.name,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          _id: mockId,
          email: registerData.email,
          name: registerData.name,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error if user already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      };

      (db.users.findOne as jest.Mock).mockResolvedValue({ email: registerData.email });

      await expect(UserService.register(registerData)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(db.users.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        _id: new ObjectId(),
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (db.users.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_jwt_token');

      const result = await UserService.login('test@example.com', 'Password123!');

      expect(db.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe('mock_jwt_token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      (db.users.findOne as jest.Mock).mockResolvedValue(null);

      await expect(UserService.login('notfound@example.com', 'Password123!')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        _id: new ObjectId(),
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
      };

      (db.users.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(UserService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
