import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, IsUUID} from "class-validator";

export class UpdateUserDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    password: string;
}