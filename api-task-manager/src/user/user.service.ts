import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto";
import {Prisma} from "@prisma/client";
import {PrismaService} from "../prisma.service";

import * as bcrypt from "bcrypt";


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    async create(userDTO: CreateUserDto) {
        try {
            const userData = { ...userDTO};

            const decryptPassword = await bcrypt.hash(userData.password, 8);

            return await this.prisma.user.create({data: {...userData, password: decryptPassword}});
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                const uniqueField = error.meta.target[0];
                const field = uniqueField.split('.').pop();
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

    async update(userId: number, userDTO: CreateUserDto) {
        try {
            return await this.prisma.user.update({
                where: {id: userId},
                data: {
                    ...userDTO,
                },
            });
        } catch (error) {
            throw new BadRequestException(
                `Failed to update user info: ${error.message}`,
            );
        }
    }

    async detail(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                password: false
            },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async delete(id: number) {
        try {
            await this.prisma.user.delete({
                where: { id }
            });
            return { message: `User with ID ${id} was successfully deleted` };
        } catch (error) {
            throw new NotFoundException(
                `Could not find user with ID ${id} to delete`,
            );
        }
    }

    async findAll(page: number, size: number) {
        const skip = page * size;

        try {
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    skip: skip,
                    take: Number(size),
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                }),
                this.prisma.user.count(),
            ]);

            return {
                data: users,
                total,
                page,
                size,
            };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve users: ${error.message}`);
        }
    }
}
