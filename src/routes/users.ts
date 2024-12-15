import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  listAddress,
  updateUser,
} from "../controllers/users";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";

const userRoutes: Router = Router();

userRoutes.get("/address", [authMiddleware], errorHandler(listAddress));
userRoutes.post("/address", [authMiddleware], errorHandler(addAddress));
userRoutes.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);
userRoutes.put("/", [authMiddleware], errorHandler(updateUser));

export default userRoutes;
