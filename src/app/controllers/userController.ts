// src/app/controllers/userController.ts
import { User, UserModel } from "../models/userModel";

export class UserController {
  static getUserList(): User[] {
    // Logic to fetch users (can add filters, sorting, etc.)
    return UserModel.getUsers();
  }
}