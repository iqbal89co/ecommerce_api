import { Request, Response } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createProduct = async (req: Request, res: Response) => {
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });
  res.json(product);
};

export const getProducts = async (req: Request, res: Response) => {
  const [count, products] = await Promise.all([
    prismaClient.product.count(),
    prismaClient.product.findMany({
      skip: +(req.query.skip || 0),
      take: +(req.query.take || 10),
    }),
  ]);
  res.json({
    count,
    data: products,
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await prismaClient.product.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    if (product.tags) {
      product.tags = product.tags.join(",");
    }

    const updatedProduct = await prismaClient.product.update({
      where: {
        id: +req.params.id,
      },
      data: product,
    });
    res.json(updatedProduct);
  } catch (err) {
    throw new NotFoundException("Product not found", ErrorCode.USER_NOT_FOUND);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.json(product);
  } catch (err) {
    throw new NotFoundException("Product not found", ErrorCode.USER_NOT_FOUND);
  }
};
