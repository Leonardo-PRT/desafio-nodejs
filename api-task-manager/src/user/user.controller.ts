import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { CreateUserDto } from "./create-user.dto";
import { UpdateUserDto } from "./update-user.dto";
import { UserService } from "./user.service";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() userDTO: CreateUserDto) {
        return await this.userService.create(userDTO);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user info' })
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
    @ApiResponse({ status: 200, description: 'User info updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async updateUserInfo(
        @Param('id') id: number,
        @Body() userDTO: UpdateUserDto,
    ) {
        return await this.userService.update(id, userDTO);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async detail(@Param('id') id: number) {
        return await this.userService.detail(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to delete' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async remove(@Param('id') id: number) {
        return await this.userService.delete(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page', type: Number })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async findAll(@Query('page') page?: number, @Query('limit') size?: number) {

        if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
            throw new BadRequestException('Invalid page or size parameters');
        }

        return this.userService.findAll(page, size);
    }
}
