import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './create-user.dto';
import { UserDetailDto } from './user-detail.dto';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
    async hash(password: string, saltOrRounds: number): Promise<string> {
        return 'hashedPassword';
    },
}));

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            create: jest.fn(),
                            update: jest.fn(),
                            findUnique: jest.fn(),
                            delete: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto: CreateUserDto = { name: 'Test user', email: 'test@test.com', password: 'password' };
            const createdUser = { id: 1, ...createUserDto, password: 'hashedPassword' };

            (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await service.create(createUserDto);

            expect(result).toEqual(createdUser);
            expect(prisma.user.create).toHaveBeenCalledWith({ data: { ...createUserDto, password: 'hashedPassword' } });
        });

        it('should throw InternalServerErrorException when user email already exists', async () => {
            const createUserDto: CreateUserDto = { name: 'Test user', email: 'test@test.com', password: 'password' };

            (prisma.user.create as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException());

            await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto: CreateUserDto = { name: 'Updated user', email: 'updated@test.com', password: 'password' };
            const updatedUser = { id: 1, ...updateUserDto };

            (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

            const result = await service.update(1, updateUserDto);

            expect(result).toEqual(updatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateUserDto,
            });
        });

        it('should throw BadRequestException when update fails', async () => {
            const updateUserDto: CreateUserDto = { name: 'Updated user', email: 'updated@test.com', password: 'password' };

            (prisma.user.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

            await expect(service.update(1, updateUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('detail', () => {
        it('should return user details', async () => {
            const userDetail: UserDetailDto = { name: 'Test user', email: 'test@test.com' };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(userDetail);

            const result = await service.detail(1);

            expect(result).toEqual(userDetail);
        });

        it('should throw NotFoundException when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.detail(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a user', async () => {
            (prisma.user.delete as jest.Mock).mockResolvedValue({});

            const result = await service.delete(1);

            expect(result).toEqual({ message: 'User with ID 1 was successfully deleted' });
        });

        it('should throw NotFoundException when user not found', async () => {
            (prisma.user.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

            await expect(service.delete(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all users with pagination', async () => {
            const users = [
                { id: 1, name: 'Test user 1', email: 'user1@test.com' },
                { id: 2, name: 'Test user 2', email: 'user2@test.com' },
            ];
            const total = 2;

            (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
            (prisma.user.count as jest.Mock).mockResolvedValue(total);

            const result = await service.findAll(0, 10);

            expect(result).toEqual({ data: users, total, page: 0, size: 10 });
        });

        it('should throw InternalServerErrorException when retrieval fails', async () => {
            (prisma.user.findMany as jest.Mock).mockRejectedValueOnce(new Error('FindMany failed'));

            await expect(service.findAll(0, 10)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
