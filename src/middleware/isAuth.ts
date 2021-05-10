import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/MyContext";

dotenv.config();

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
    const authHeader = context.req.headers.authorization?.startsWith("Bearer ")
        ? context.req.headers.authorization
        : null;

    try {
        if (!authHeader) {
            throw new Error("Not authenticated");
        }

        const token = authHeader.split(" ")[1];

        if (process.env.JWT_ACCESS_SECRET) {
            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            context.payload = payload as any;
        }
    } catch (error) {
        throw new Error("Not authenticated");
    }

    return next();
};
