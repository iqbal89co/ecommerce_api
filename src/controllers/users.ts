import { Request, Response } from "express";
import { prismaClient } from "..";
import { AddressSchema, UpdateUserSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Address } from "@prisma/client";
import { BadRequestException } from "../exceptions/bad-requests";

export const addAddress = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);
  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });
  res.json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const address = await prismaClient.address.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.json({ success: true });
  } catch (error) {
    throw new NotFoundException("Address not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const listAddress = async (req: Request, res: Response) => {
  const addresses = await prismaClient.address.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.json(addresses);
};

export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdateUserSchema.parse(req.body);
  let shippingAddress: Address;
  let billingAddress: Address;
  if (validatedData.defaultShippingAddress) {
    try {
      shippingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultShippingAddress,
        },
      });
      if (shippingAddress.userId !== req.user.id) {
        throw new BadRequestException(
          "Address does not belong to user",
          ErrorCode.UNPROCESSABLE_ENTITY,
          null
        );
      }
    } catch (err) {
      throw new NotFoundException(
        "Address not found",
        ErrorCode.USER_NOT_FOUND
      );
    }
  }
  if (validatedData.defaultBillingAddress) {
    try {
      const billingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultBillingAddress,
        },
      });

      if (billingAddress.userId !== req.user.id) {
        throw new BadRequestException(
          "Address does not belong to user",
          ErrorCode.UNPROCESSABLE_ENTITY,
          null
        );
      }
    } catch (err) {
      throw new NotFoundException(
        "Address not found",
        ErrorCode.USER_NOT_FOUND
      );
    }
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: req.user.id,
    },
    data: validatedData,
  });
  res.json(updatedUser);
};
