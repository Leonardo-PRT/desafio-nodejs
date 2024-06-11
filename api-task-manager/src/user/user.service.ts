import {BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from "./create-user.dto";
import {Prisma} from "@prisma/client";
import {PrismaService} from "../prisma.service";

import * as bcrypt from "bcrypt";
import {UserDetailDto} from "./user-detail.dto";
import {ProjectService} from "../project/project.service";

@Injectable()
export class UserService {
    private readonly logger = new Logger(ProjectService.name);

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

                this.logger.error(`User with ${field} ${value} already exists`);
                throw new BadRequestException(`User with ${field} ${value} already exists`);
            }

            this.logger.error(`Failed to create user: ${error.message}`);
            throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
        }
    }

    async update(userId: number, userDTO: CreateUserDto) {
        try {
            return await this.prisma.user.update({
                where: {id: Number(userId)},
                data: {
                    ...userDTO,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to update user info: ${error.message}`);
            throw new BadRequestException(
                `Failed to update user info: ${error.message}`,
            );
        }
    }

    async detail(id: number):Promise<UserDetailDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                email: true,
                password: false
            },
        });
        if (!user) {
            this.logger.error(`User with ID ${id} not found`);
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async delete(id: number) {
        try {
            await this.prisma.user.delete({
                where: { id: Number(id) }
            });
            return { message: `User with ID ${id} was successfully deleted` };
        } catch (error) {
            this.logger.error(`Could not find user with ID ${id} to delete`);
            throw new NotFoundException(`Could not find user with ID ${id} to delete`);
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
            this.logger.error(`Failed to retrieve users: ${error.message}`);
            throw new InternalServerErrorException(`Failed to retrieve users: ${error.message}`);
        }
    }
}
