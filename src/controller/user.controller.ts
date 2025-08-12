import db from "@/db";
import { users } from "@/db/schema";
import { Request, Response } from "express";

export const makeUser = async (req: Request, res: Response): Promise<any> => {
  // console.log("hiiii");
  // console.log("db: ", db);

  return res.status(200).json({ user: {} });
};
