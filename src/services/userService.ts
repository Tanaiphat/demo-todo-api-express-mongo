import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import { RegisterDTO, User, UserWithoutPassword } from '../models/user';

const SALT_ROUNDS = 10;

export class UserService {
  /**
   * Registers a new user.
   * @param data The validated registration data
   * @returns The created user (without password)
   */
  static async register(data: RegisterDTO): Promise<UserWithoutPassword> {
    const existingUser = await db.users.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const now = new Date();
    const userDoc = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.users.insertOne(userDoc);

    // Return user without password
    const { password: _, ...userWithoutPassword } = {
      _id: result.insertedId,
      ...userDoc,
    };

    return userWithoutPassword as UserWithoutPassword;
  }

  /**
   * Authenticates a user and returns a JWT token.
   * @param email User's email
   * @param password User's password
   * @returns Object containing user (without password) and JWT token
   */
  static async login(
    email: string,
    password: string,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    const user = (await db.users.findOne({ email })) as User | null;
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      token,
    };
  }

  /**
   * Finds a user by ID.
   * @param userId The user's ID
   * @returns The user or null
   */
  static async findById(userId: string): Promise<UserWithoutPassword | null> {
    const { ObjectId } = await import('mongodb');
    const user = (await db.users.findOne({ _id: new ObjectId(userId) })) as User | null;
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }
}
