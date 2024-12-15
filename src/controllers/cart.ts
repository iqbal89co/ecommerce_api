import { Request, Response } from "express";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Product } from "@prisma/client";
import { prismaClient } from "..";
import { BadRequestException } from "../exceptions/bad-requests";

export const addItemToCart = async (req: Request, res: Response) => {
  const validatedData = CreateCartSchema.parse(req.body);
  let product: Product;
  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: validatedData.productId,
      },
    });
  } catch (err) {
    throw new NotFoundException("Product not found", ErrorCode.USER_NOT_FOUND);
  }
  const cartItem = await prismaClient.cartItem.findFirst({
    where: {
      productId: validatedData.productId,
      userId: req.user.id,
    },
  });
  console.log(cartItem);

  if (cartItem) {
    const updatedCart = await prismaClient.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity: cartItem.quantity + validatedData.quantity,
      },
    });
    return res.json(updatedCart);
  }
  const cart = await prismaClient.cartItem.create({
    data: {
      userId: req.user.id,
      productId: product.id,
      quantity: validatedData.quantity,
    },
  });
  res.json(cart);
};

export const deleteItemFromCart = async (req: Request, res: Response) => {
  // check if user has the cart item
  const cartItem = await prismaClient.cartItem.findFirstOrThrow({
    where: {
      id: parseInt(req.params.id),
    },
  });
  if (cartItem.userId !== req.user.id) {
    throw new BadRequestException(
      "You are not allowed to delete this item",
      ErrorCode.UNAUTHORIZED,
      null
    );
  }
  const cart = await prismaClient.cartItem.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });
  res.json({ success: true });
};

export const changeQuantity = async (req: Request, res: Response) => {
  // check if user has the cart item
  const cartItem = await prismaClient.cartItem.findFirstOrThrow({
    where: {
      id: parseInt(req.params.id),
    },
  });
  if (cartItem.userId !== req.user.id) {
    throw new BadRequestException(
      "You are not allowed to update this item",
      ErrorCode.UNAUTHORIZED,
      null
    );
  }
  const validatedData = ChangeQuantitySchema.parse(req.body);
  const updatedCart = await prismaClient.cartItem.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: {
      quantity: validatedData.quantity,
    },
  });
  res.json(updatedCart);
};

export const getCart = async (req: Request, res: Response) => {
  const cart = await prismaClient.cartItem.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      product: true,
    },
  });
  res.json(cart);
};
