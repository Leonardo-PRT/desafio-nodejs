import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {CreateUserDto} from "./create-user.dto";
import {UpdateUserDto} from "./update-user.dto";
import {UserDetailDto} from "./user-detail.dto";

describe('UserController', () => {
    let userController: UserController;
    let userService: jest.Mocked<UserService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        detail: jest.fn(),
                        delete: jest.fn(),
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = { name: 'Test', email: 'test@test.com', password: 'test123' };
            const createdUser = { id: 1, ...createUserDto };
            userService.create.mockResolvedValue(createdUser);

            const result = await userController.create(createUserDto);

            expect(result).toEqual(createdUser);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should throw a BadRequestException if creation fails', async () => {
            const createUserDto: CreateUserDto = { name: 'Test', email: 'test@test.com', password: 'test123' };
            userService.create.mockRejectedValue(new BadRequestException());

            await expect(userController.create(createUserDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateUserInfo', () => {
        it('should update a user', async () => {
            const updateUserDto: UpdateUserDto = { name: 'Updated Test', email: 'updated@test.com', password: 'updated123' };
            const id = 1;
            const updatedUser = { id, ...updateUserDto };
            userService.update.mockResolvedValue(updatedUser);

            const result = await userController.updateUserInfo(id, updateUserDto);

            expect(result).toEqual(updatedUser);
            expect(userService.update).toHaveBeenCalledWith(id, updateUserDto);
        });

        it('should throw NotFoundException if user not found', async () => {
            const updateUserDto: UpdateUserDto = { name: 'Updated Test', email: 'updated@test.com', password: 'updated123' };
            const id = 1;
            userService.update.mockRejectedValue(new NotFoundException());

            await expect(userController.updateUserInfo(id, updateUserDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('detail', () => {
        it('should return user details', async () => {
            const userDetailDto: UserDetailDto = { name: 'Test', email: 'test@test.com' };
            const id = 1;
            userService.detail.mockResolvedValue(userDetailDto);

            const result = await userController.detail(id);

            expect(result).toEqual(userDetailDto);
            expect(userService.detail).toHaveBeenCalledWith(id);
        });

        it('should throw NotFoundException if user not found', async () => {
            const id = 1;
            userService.detail.mockRejectedValue(new NotFoundException());

            await expect(userController.detail(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a user', async () => {
            const id = 1;
            userService.delete.mockResolvedValue({ message: 'User deleted successfully' });

            const result = await userController.remove(id);

            expect(result).toEqual({ message: 'User deleted successfully' });
            expect(userService.delete).toHaveBeenCalledWith(id);
        });

        it('should throw NotFoundException if user not found', async () => {
            const id = 1;
            userService.delete.mockRejectedValue(new NotFoundException());

            await expect(userController.remove(id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return a paginated list of users', async () => {
            const paginatedResponse = {
                data: [{ id: 1, name: 'Test', email: 'test@test.com' }],
                total: 1,
                page: 1,
                size: 10,
            };
            userService.findAll.mockResolvedValue(paginatedResponse);

            const result = await userController.findAll(1, 10);

            expect(result).toEqual(paginatedResponse);
            expect(userService.findAll).toHaveBeenCalledWith(1, 10);
        });

        it('should throw BadRequestException if page or size is invalid', async () => {
            await expect(userController.findAll(-1, 10)).rejects.toThrow(BadRequestException);
            await expect(userController.findAll(1, -10)).rejects.toThrow(BadRequestException);
        });
    });
});
