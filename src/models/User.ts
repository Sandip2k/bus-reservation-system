import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import { Role } from "./Role";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
    @Field(() => ID)
    @ObjectIdColumn()
    id!: string;

    @Field()
    @Column()
    firstName!: string;

    @Field()
    @Column()
    lastName!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Column()
    password!: string;

    @Field(() => [Role!]!)
    @Column(() => Role)
    roles!: Role[];
}
