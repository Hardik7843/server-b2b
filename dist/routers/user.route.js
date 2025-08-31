"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
// import { makeUser } from "../controller/user.controller";
exports.userRouter = (0, express_1.Router)();
// userRouter.post('/createOne', UserCreator)
// userRouter.delete('/truncate', UserTruncate)
// userRouter.post('/update', updateUser)
exports.userRouter.get("/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("hiii", req.user);
    return res.status(200).json({
        success: true,
        data: { user: req.user },
        message: "User Detail Fetched",
    });
}));
// userRouter.post("/signup", signup);
// userRouter.post("/login", login);
// userRouter.post("/logout", logout);
// userRouter.use(protectedView);
// userRouter.put("/updateProfile", updateProfile);
// userRouter.get("/check", checkAuth);
// userRouter.post("/createOne", makeUser);
exports.default = exports.userRouter;
