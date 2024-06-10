import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class AddMemberDto {
    @ApiProperty()
    @IsNotEmpty({message: 'UserId is required'})
    userId: number;

    @ApiProperty()
    @IsNotEmpty({message: 'ProjectId is required'})
    projectId: number;
}
