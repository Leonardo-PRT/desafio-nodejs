import {Body, Controller, Get, Post} from '@nestjs/common';
import {UserService} from "../service/user.service";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserDTO} from "../dto/user.dto";

@ApiTags('User')
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    async create(@Body() userDTO: UserDTO) {
        return await this.userService.create(userDTO);
    }
}
