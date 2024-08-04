// lib/database.ts
import { User } from "./user";

export interface Database {
  init(): Promise<void>;
  connect(dbName?: string): Promise<void>;
  close(): Promise<void>;
  getUsers(): Promise<User[]>;
  getUserByName(name: string): Promise<User | null>;
  insertUser(user: User): Promise<number>;
  deleteUser(name: string): Promise<void>;
  updateUser(user: User): Promise<void>;
  checkPassword(name: string, password: string): Promise<boolean>;

}


