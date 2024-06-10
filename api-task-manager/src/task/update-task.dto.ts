import { IsString, IsInt, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateTaskDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    status?: TaskStatus;

    @ApiProperty({ type: [Number] })
    @IsArray()
    tags: number[];
}

export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Done = 'Done'
}