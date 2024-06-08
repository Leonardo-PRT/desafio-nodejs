import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, IsUUID} from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'Name is required'})
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'Email is required'})
    email: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Password is required'})
    password: string;
}