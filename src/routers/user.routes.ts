import { Request, Response, Router } from "express";
import { makeUser } from "../controller/user.controller";

export const userrouter = Router()

// userrouter.post('/createOne', UserCreator)
// userrouter.delete('/truncate', UserTruncate)
// userrouter.post('/update', updateUser)
userrouter.get('/', (req: Request, res: Response) =>
{
    res.status(200).send({ message: "hiii" })
})

userrouter.post('/createOne', makeUser)

export default userrouter;