import bcrypt from "bcryptjs";
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { LoginResponse } from "../../../models/LoginResponse";
import { Role } from "../../../models/Role";
import { User } from "../../../models/User";
import { RegisterInput } from "./register/RegisterInput";
import { MyContext } from "../../../types/MyContext";
import { createAccessToken, createRefreshToken } from "../../../auth";
import { isAuth } from "../../../middleware/isAuth";
import { client } from "../../../redis";

@Resolver(User)
export class UserResolver {
    @Query(() => String)
    async hello(): Promise<string> {
        return "Hello World";
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    async bye(@Ctx() { payload }: MyContext): Promise<String> {
        console.log((payload as any).userId);
        return "Bye!";
    }

    @Query(() => [User])
    async users(): Promise<User[]> {
        return User.find();
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error("Invalid username or password");
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new Error("Invalid username or password");
        }

        // login successful, return JWT

        const refreshToken = createRefreshToken(user);

        let noError = false;

        try {
            const result = await client.set(
                user.id.toString(),
                refreshToken.toString(),
                "EX",
                24 * 7 * 60 * 60
            );
            if (result === "OK") {
                noError = true;
            }
        } catch (error) {
            console.log(error);
            throw new Error("Internal Server error.");
        }

        if (noError) {
            res.cookie("jid", refreshToken, { httpOnly: true });

            return {
                user,
                accessToken: createAccessToken(user),
            };
        } else {
            throw new Error("Internal Server Error");
        }
    }

    @Mutation(() => Boolean)
    async register(
        @Arg("input")
        { firstName, lastName, email, password, roles }: RegisterInput
    ): Promise<Boolean> {
        try {
            const hashedPassword: string = await bcrypt.hash(password, 12);

            let userRoles: Role[];

            if (!roles) {
                userRoles = [new Role("USER")];
            } else {
                userRoles = roles.map((role) => new Role(role));
            }

            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            }).save();

            user.roles = userRoles;
            user.save();

            return true;
        } catch (error) {
            return false;
        }
    }
}
