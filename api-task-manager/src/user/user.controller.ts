import {Body, Controller, Delete, Get, Param, Patch, Post, Put, UsePipes, ValidationPipe} from '@nestjs/common';
import {UserService} from "./user.service";
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "./create-user.dto";
import {UpdateUserDto} from "./update-user.dto";
import {SimpleUserDto} from "./simple-user.dto";

@ApiTags('User')
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() userDTO: CreateUserDto) {
        return await this.userService.create(userDTO);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user info' })
    @ApiResponse({ status: 200, description: 'User info updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async updateUserInfo(
        @Param('id') id: string,
        @Body() userDTO: UpdateUserDto,
    ) {
        return await this.userService.update(+id, userDTO);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
    async detail(@Param('id') id: string) {
        return await this.userService.detail(+id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to delete' })
    async remove(@Param('id') id: string) {
        return await this.userService.delete(+id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    async findAll() {
        return this.userService.findAll();
    }
}
