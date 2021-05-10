import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsUserAlreadyExist } from "./IsUserAlreadyExist";

@InputType()
export class RegisterInput {
    @Field()
    @MinLength(1)
    @MaxLength(30)
    firstName!: string;

    @Field()
    @MinLength(1)
    @MaxLength(30)
    lastName!: string;

    @Field()
    @IsEmail()
    @MaxLength(60)
    @IsUserAlreadyExist({
        message: "User with this email already exists.",
    })
    email!: string;

    @Field()
    @MinLength(8)
    password!: string;

    @Field(() => [String], { nullable: true })
    roles?: string[];
}
