import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class UpdateProjectDto {

    @ApiProperty()
    @IsNotEmpty({message: 'UserId is required'})
    ownerId: number

    @ApiProperty()
    membersId: number[]

    @ApiProperty()
    name: string

    @ApiProperty()
    description: string

}