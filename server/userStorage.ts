import { 
  users, 
  userSessions, 
  userPermissions,
  type User, 
  type UserSession,
  type UserPermission,
  type InsertUser, 
  type UpdateUser,
  type InsertUserSession,
  type InsertUserPermission,
  type UserRole,
  rolePermissions 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IUserStorage {
  // User CRUD operations
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser & { password?: string }): Promise<User>;
  updateUser(id: number, userData: UpdateUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Authentication
  validatePassword(email: string, password: string): Promise<User | null>;
  createSession(userId: number, sessionData: Omit<InsertUserSession, 'userId'>): Promise<UserSession>;
  validateSession(token: string): Promise<{ user: User; session: UserSession } | null>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: number): Promise<void>;
  
  // Permissions
  getUserPermissions(userId: number): Promise<UserPermission[]>;
  addUserPermission(userId: number, permission: string, resource: string): Promise<UserPermission>;
  removeUserPermission(userId: number, permission: string, resource: string): Promise<void>;
  hasPermission(userId: number, permission: string, resource?: string): Promise<boolean>;
}

export class DatabaseUserStorage implements IUserStorage {
  // User CRUD operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true)).orderBy(desc(users.createdAt));
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.isActive, true)));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isActive, true)));
    return user;
  }

  async createUser(userData: InsertUser & { password?: string }): Promise<User> {
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : null;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    // Soft delete by setting isActive to false
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
      
    // Delete all user sessions
    await this.deleteUserSessions(id);
  }

  // Authentication
  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
    
    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    return user;
  }

  async createSession(userId: number, sessionData: Omit<InsertUserSession, 'userId'>): Promise<UserSession> {
    const [session] = await db
      .insert(userSessions)
      .values({
        ...sessionData,
        userId,
      })
      .returning();
      
    return session;
  }

  async validateSession(token: string): Promise<{ user: User; session: UserSession } | null> {
    const [sessionRecord] = await db
      .select()
      .from(userSessions)
      .where(and(
        eq(userSessions.token, token),
        gt(userSessions.expiresAt, new Date())
      ));
      
    if (!sessionRecord) {
      return null;
    }
    
    const user = await this.getUserById(sessionRecord.userId);
    if (!user) {
      return null;
    }
    
    return { user, session: sessionRecord };
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.token, token));
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // Permissions
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
  }

  async addUserPermission(userId: number, permission: string, resource: string): Promise<UserPermission> {
    const [userPermission] = await db
      .insert(userPermissions)
      .values({ userId, permission, resource })
      .returning();
      
    return userPermission;
  }

  async removeUserPermission(userId: number, permission: string, resource: string): Promise<void> {
    await db.delete(userPermissions).where(
      and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permission, permission),
        eq(userPermissions.resource, resource)
      )
    );
  }

  async hasPermission(userId: number, permission: string, resource: string = "*"): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      return false;
    }
    
    const userRole = user.role as UserRole;
    const rolePerms = rolePermissions[userRole] || [];
    
    // Check if user has admin role (all permissions)
    if (rolePerms.includes("*")) {
      return true;
    }
    
    // Check specific permission
    const requiredPermission = `${resource}:${permission}`;
    if (rolePerms.includes(requiredPermission)) {
      return true;
    }
    
    // Check custom user permissions
    const customPermissions = await this.getUserPermissions(userId);
    return customPermissions.some(p => 
      p.permission === permission && (p.resource === resource || p.resource === "*")
    );
  }
}

export const userStorage = new DatabaseUserStorage();