import {ApiProperty} from "@nestjs/swagger";

export class UserDetailDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;
}