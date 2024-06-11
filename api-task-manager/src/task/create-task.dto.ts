import { IsString, IsInt, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateTaskDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'Name is required'})
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status: TaskStatus;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    projectId: number;

    @ApiProperty({ type: [Number] })
    @IsArray()
    tags: number[];
}

export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Done = 'Done'
}
