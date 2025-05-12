import db from "../db"
import { usersTable } from "../db/schema"
import { Request, Response } from "express"

export const makeUser = async (req: Request, res: Response): Promise<any> =>
{

    const [inserted] = await db.insert(usersTable).values({
        name: "Hardik",
        email: "exampl@gmail.com",

        age: 12
    }).returning()

    console.log("hii return object: ", inserted)

    return res.status(200).send({ user: inserted })
}