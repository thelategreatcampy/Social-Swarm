import { User } from '../types';

class MockStore {
  private users: User[] = [];
  private STORAGE_KEY = 'social_swarm_db_users';

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load user db", e);
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
  }

  ensureAdminExists() {
     // Ensure the admin user is technically in the "database" for consistency
     // although AuthContext handles the override directly.
     const adminEmail = 'admin@socialswarm.net';
     if (!this.users.find(u => u.email === adminEmail)) {
        // We don't necessarily need to force add here if AuthContext handles it, 
        // but it helps for listing users in Admin Dashboard later.
     }
  }

  login(email: string, passwordHash: string): User | undefined {
    // Simple case-insensitive email match
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash);
  }

  register(user: User): void {
     if (this.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
       throw new Error("User already exists");
     }
     this.users.push(user);
     this.save();
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...updates };
    this.save();
    return this.users[index];
  }
  
  getAllUsers(): User[] {
    return this.users;
  }
}

export const store = new MockStore();