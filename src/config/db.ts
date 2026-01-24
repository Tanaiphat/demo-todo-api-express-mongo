import { MongoClient, Db } from 'mongodb';
import { env } from './env';

class Database {
  private static instance: Database;
  private client: MongoClient;
  private db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(env.MONGO_URI);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.db) return;

    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('🚀 Connected to MongoDB');

      process.on('SIGINT', this.disconnect.bind(this));
      process.on('SIGTERM', this.disconnect.bind(this));
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  public getClient(): MongoClient {
    return this.client;
  }

  public getCollection<T extends import('mongodb').Document>(name: string) {
    return this.getDb().collection<T>(name);
  }

  public get tasks() {
    return this.getCollection('tasks');
  }

  public get projects() {
    return this.getCollection('projects');
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('👋 MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during MongoDB disconnection:', error);
      process.exit(1);
    }
  }
}

export const db = Database.getInstance();
