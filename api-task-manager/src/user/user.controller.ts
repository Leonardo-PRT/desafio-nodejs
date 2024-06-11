import {
    ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common";
import { CreateUserDto } from "./create-user.dto";
import { UpdateUserDto } from "./update-user.dto";
import { UserService } from "./user.service";
import {User} from "@prisma/client";
import {UserDetailDto} from "./user-detail.dto";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ description: 'Create user body', type: CreateUserDto})
    @ApiCreatedResponse({ description: 'User created successfully.' })
    @ApiBadRequestResponse({ description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() userDTO: CreateUserDto):Promise<CreateUserDto> {
        return await this.userService.create(userDTO);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user info' })
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
    @ApiBody({ description: 'Update user body',type: UpdateUserDto })
    @ApiOkResponse({ description: 'User updated successfully.' })
    @ApiBadRequestResponse({ description: 'Bad Request.' })
    @ApiNotFoundResponse({description: 'User not found.' })
    async updateUserInfo(
        @Param('id') id: number,
        @Body() userDTO: UpdateUserDto,
    ): Promise<UpdateUserDto> {
        return await this.userService.update(id, userDTO);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
    @ApiOkResponse({ description: 'User retrieved successfully.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    async detail(@Param('id') id: number):Promise<UserDetailDto> {
        return await this.userService.detail(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the user to delete' })
    @ApiOkResponse({ description: 'User deleted successfully.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    async remove(@Param('id') id: number) {
        return await this.userService.delete(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of users per page', type: Number })
    @ApiOkResponse({ description: 'Users retrieved successfully.' })
    @ApiBadRequestResponse({ description: 'Bad Request.' })
    async findAll(@Query('page') page?: number, @Query('limit') size?: number) {

        if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
            throw new BadRequestException('Invalid page or size parameters');
        }

        return this.userService.findAll(page, size);
    }
}
