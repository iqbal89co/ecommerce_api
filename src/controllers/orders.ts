import { prismaClient } from "..";
import { Request, Response } from "express";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-requests";

export const createOrder = async (req: Request, res: Response) => {
  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        product: true,
      },
    });
    if (cartItems.length === 0) {
      return res.json({ message: "Cart is empty" });
    }
    const price = cartItems.reduce((prev, current) => {
      return prev + +current.product.price * current.quantity;
    }, 0);
    const address = await tx.address.findFirst({
      where: {
        id: req.user.defaultShippingAddress || undefined,
      },
    });
    const order = await tx.order.create({
      data: {
        userId: req.user.id,
        netAmount: price,
        address: address?.formattedAddress || "No address provided",
        products: {
          create: cartItems.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });
    const orderEvent = await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });
    await tx.cartItem.deleteMany({
      where: {
        userId: req.user.id,
      },
    });
    return res.json(order);
  });
};

export const listOrders = async (req: Request, res: Response) => {
  const orders = await prismaClient.order.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });
  res.json(orders);
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    return await prismaClient.$transaction(async (tx) => {
      const order = await tx.order.findFirstOrThrow({
        where: {
          id: +req.params.id,
        },
      });
      if (order.userId !== req.user.id) {
        throw new BadRequestException(
          "Order not found",
          ErrorCode.UNAUTHORIZED,
          null
        );
      }
      const updatedOrder = await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "CANCELLED",
        },
      });
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
        },
      });
      res.json(updatedOrder);
    });
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
      include: {
        products: true,
        events: true,
      },
    });
    res.json(order);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const listAllOrders = async (req: Request, res: Response) => {
  let whereClause = {};
  const status = req.query.status;
  if (status) {
    whereClause = {
      status,
    };
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: +(req.query.skip || 0),
    take: 5,
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });
  res.json(orders);
};

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.update({
      where: {
        id: +req.params.id,
      },
      data: {
        status: req.body.status,
      },
    });
    await prismaClient.orderEvent.create({
      data: {
        orderId: order.id,
        status: req.body.status,
      },
    });
    res.json(order);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const listUserOrders = async (req: Request, res: Response) => {
  let whereClause: any = {
    userId: +req.params.id,
  };
  const status = req.query.status;
  if (status) {
    whereClause = {
      ...whereClause,
      status,
    };
  }
  console.log(whereClause);
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: +(req.query.skip || 0),
    take: 5,
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });
  res.json(orders);
};
