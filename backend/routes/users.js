import { Router } from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";
import { requireAdmin, requireAdminOrOwner } from "../middlewares/auth.js";
import { getUserFromCache, getUsersFromCache } from "../middlewares/user.js";

const usersRoutes = Router();

usersRoutes.get("/users", getUsersFromCache, getUsers);
usersRoutes.get("/users/:id", getUserFromCache, getUser);
usersRoutes.patch("/users/:id", updateUser);
usersRoutes.delete("/users/:id", deleteUser);

export default usersRoutes;
