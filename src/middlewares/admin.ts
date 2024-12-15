import { Response, NextFunction, Request } from "express";
import { UnauthorizedExcetion } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user.role == "ADMIN") {
    next();
  } else {
    next(new UnauthorizedExcetion("Unauthorized", ErrorCode.UNAUTHORIZED));
  }
};

export default adminMiddleware;
