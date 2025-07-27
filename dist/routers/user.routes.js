"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
// import { makeUser } from "../controller/user.controller";
exports.userRouter = (0, express_1.Router)();
// userRouter.post('/createOne', UserCreator)
// userRouter.delete('/truncate', UserTruncate)
// userRouter.post('/update', updateUser)
exports.userRouter.get("/check", (req, res) => {
    res.status(200).send({ message: "hiiiiiiii" });
});
exports.default = exports.userRouter;
