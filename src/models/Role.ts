import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column } from "typeorm";

@ObjectType()
export class Role extends BaseEntity {
    @Field()
    @Column()
    name!: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}
