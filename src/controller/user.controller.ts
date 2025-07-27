import db from "@/db";
import { users } from "@/db/schema";
import { Request, Response } from "express";

export const makeUser = async (req: Request, res: Response): Promise<any> => {
  console.log("hiiiiiii");

  return res.status(200).send({ user: {} });
};
