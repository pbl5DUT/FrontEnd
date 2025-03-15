// src/app/models/userModel.ts
export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export class UserModel {
    static getUsers(): User[] {
      // Simulated user data (replace with API call or database query in a real app)
      return [
        { id: 1, name: "Cường", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com" },
      ];
    }
  }