import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { CreateTaskDto } from './create-task.dto';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './update-task.dto';

@ApiTags('Task')
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post('/create-task')
    @ApiOperation({ summary: 'Create a task in a project' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID of the user creating the task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createTask(@Body() createTaskDto: CreateTaskDto, @Query('userId') userId: number) {
        return await this.taskService.createTask(createTaskDto, userId);
    }

    @Get('/task/:taskId')
    @ApiOperation({ summary: 'Get a task by ID' })
    @ApiParam({ name: 'taskId', required: true, description: 'ID of the task to retrieve' })
    @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async getTaskById(@Param('taskId') taskId: number) {
        return await this.taskService.getTaskById(taskId);
    }

    @Patch('/task/:taskId')
    @ApiOperation({ summary: 'Update a task by ID' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID of the user updating the task' })
    @ApiParam({ name: 'taskId', required: true, description: 'ID of the task to update' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateTask(
        @Param('taskId') taskId: number,
        @Body() updateTaskDto: UpdateTaskDto,
        @Query('userId') userId: number,
    ) {
        return await this.taskService.updateTask(taskId, updateTaskDto, userId);
    }

    @Delete('/task/:taskId')
    @ApiOperation({ summary: 'Delete a task by ID' })
    @ApiQuery({ name: 'userId', required: true, description: 'ID of the user deleting the task' })
    @ApiParam({ name: 'taskId', required: true, description: 'ID of the task to delete' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Task not found' })
    async deleteTask(@Param('taskId') taskId: number, @Query('userId') userId: number) {
        return await this.taskService.deleteTask(taskId, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'size', required: false, type: Number, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async findAll(
        @Query('page') page: number = 0,
        @Query('size') size: number = 10
    ) {
        if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
            throw new BadRequestException('Invalid page or size parameters');
        }
        return await this.taskService.findAll(page, size);
    }
}
