import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty({message: 'UserId is required'})
    ownerId: number

    @ApiProperty()
    @IsNotEmpty({message: 'Name is required'})
    name: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'Email is required'})
    description: string

}