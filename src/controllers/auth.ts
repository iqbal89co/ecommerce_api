import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { compareSync, hashSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { SignUpSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name } = req.body;
  let user = await prismaClient.user.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    return next(
      new BadRequestException(
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS,
        null
      )
    );
  }

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  res.json(user);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  let user = await prismaClient.user.findFirst({
    where: {
      email: email,
    },
  });
  if (!user) {
    return next(
      new NotFoundException("User does not exists", ErrorCode.USER_NOT_FOUND)
    );
  }
  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestException(
        "Invalid password",
        ErrorCode.INVALID_PASSWORD,
        null
      )
    );
  }
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  res.json({ user, token });
};

export const me = async (req: Request, res: Response) => {
  res.json(req.user);
};
