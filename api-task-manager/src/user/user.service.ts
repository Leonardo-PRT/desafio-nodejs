import {BadRequestException, Body, Injectable, InternalServerErrorException, Post} from '@nestjs/common';
import {UserDTO} from "../dto/user.dto";
import {ApiOperation} from "@nestjs/swagger";
import {Prisma} from "@prisma/client";
import {PrismaService} from "../prisma.service";


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    async create(userDTO: UserDTO) {
        try {
            const userData = { ...userDTO};
            const user = await this.prisma.user.create({ data: userData });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                const field = error.meta.target[0].split('.')[1];
                const value = userDTO[field];
                throw new BadRequestException(
                    `User with ${field} ${value} already exists`,
                );
            }
            throw new InternalServerErrorException(
                `Failed to create user: ${error.message}`,
            );
        }
    }
}
