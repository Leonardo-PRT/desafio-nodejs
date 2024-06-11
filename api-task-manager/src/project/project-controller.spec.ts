import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './create-project.dto';
import { UpdateProjectDto } from './update-project.dto';
import { AddMemberDto } from './add-menber.dto';
import {NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException} from '@nestjs/common';

describe('ProjectController', () => {
    let controller: ProjectController;
    let service: ProjectService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectController],
            providers: [
                {
                    provide: ProjectService,
                    useValue: {
                        create: jest.fn(),
                        addMember: jest.fn(),
                        removeMember: jest.fn(),
                        update: jest.fn(),
                        findAll: jest.fn(),
                        detail: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ProjectController>(ProjectController);
        service = module.get<ProjectService>(ProjectService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a project', async () => {
            const createProjectDto: CreateProjectDto = {
                ownerId: 1,
                name: 'Test Project',
                description: 'Test Description'
            };
            const createdProject = { id: 1, ...createProjectDto };

            jest.spyOn(service, 'create').mockResolvedValue(createdProject);

            const result = await controller.create(createProjectDto);

            expect(result).toEqual(createdProject);
            expect(service.create).toHaveBeenCalledWith(createProjectDto);
        });
    });

    describe('addMember', () => {
        it('should add a member to a project', async () => {
            const addMemberDto: AddMemberDto = { userId: 2, projectId: 1 };
            const mock = { id: 1, ...addMemberDto };

            jest.spyOn(service, 'addMember').mockResolvedValue(mock);

            const result = await controller.addMember(addMemberDto, 1);

            expect(service.addMember).toHaveBeenCalledWith(addMemberDto, 1);
        });
    });

    describe('removeMember', () => {
        it('should remove a member from a project', async () => {
            const projectId = 1;
            const memberId = 2;

            jest.spyOn(service, 'removeMember').mockResolvedValue({ message: 'Member removed successfully' });

            const result = await controller.removeMember(projectId, memberId, 1);

            expect(result).toEqual({ message: 'Member removed successfully' });
            expect(service.removeMember).toHaveBeenCalledWith(projectId, memberId, 1);
        });
    });

    describe('update', () => {
        it('should update project details', async () => {
            const projectId = 1;
            const updateProjectDto: UpdateProjectDto = { name: 'Updated Project', description: 'Updated Description' };
            const mock = { id: 1, ...updateProjectDto, ownerId: 1 };

            jest.spyOn(service, 'update').mockResolvedValue(mock);

            const result = await controller.update(projectId, updateProjectDto);

            expect(result).toEqual(mock);
            expect(service.update).toHaveBeenCalledWith(projectId, updateProjectDto);
        });
    });

    describe('findAll', () => {
        it('should return all projects with pagination', async () => {
            const page = 0;
            const size = 10;
            const projects = [{ id: 1, name: 'Project 1', description: 'descricao', ownerId: 1 }, { id: 2, name: 'Project 2', description: 'test', ownerId: 1}];
            const total = 2;

            jest.spyOn(service, 'findAll').mockResolvedValue({ data: projects, total, page, size });

            const result = await controller.findAll(page, size);

            expect(result).toEqual({ data: projects, total, page, size });
            expect(service.findAll).toHaveBeenCalledWith(page, size);
        });

        it('should throw BadRequestException if page or size parameters are invalid', async () => {
            const invalidPage = -1;
            const invalidSize = 0;

            jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

            await expect(controller.findAll(invalidPage, invalidSize)).rejects.toThrow(BadRequestException);
        });
    });

    describe('error handling', () => {
        describe('create', () => {
            it('should throw NotFoundException if user not found', async () => {
                const createProjectDto: CreateProjectDto = {
                    ownerId: 1,
                    name: 'Test Project',
                    description: 'Test Description'
                };

                jest.spyOn(service, 'create').mockRejectedValue(new NotFoundException());

                await expect(controller.create(createProjectDto)).rejects.toThrow(NotFoundException);
                expect(service.create).toHaveBeenCalledWith(createProjectDto);
            });

            it('should throw InternalServerErrorException if create fails', async () => {
                const createProjectDto: CreateProjectDto = {
                    ownerId: 1,
                    name: 'Test Project',
                    description: 'Test Description'
                };

                jest.spyOn(service, 'create').mockRejectedValue(new InternalServerErrorException());

                await expect(controller.create(createProjectDto)).rejects.toThrow(InternalServerErrorException);
                expect(service.create).toHaveBeenCalledWith(createProjectDto);
            });
        });

        describe('addMember', () => {
            it('should throw NotFoundException if project not found', async () => {
                const addMemberDto: AddMemberDto = { userId: 2, projectId: 1 };

                jest.spyOn(service, 'addMember').mockRejectedValue(new NotFoundException());

                await expect(controller.addMember(addMemberDto, 1)).rejects.toThrow(NotFoundException);
                expect(service.addMember).toHaveBeenCalledWith(addMemberDto, 1);
            });

            it('should throw ForbiddenException if ownerId does not match project owner', async () => {
                const addMemberDto: AddMemberDto = { userId: 2, projectId: 1 };

                jest.spyOn(service, 'addMember').mockRejectedValue(new ForbiddenException());

                await expect(controller.addMember(addMemberDto, 1)).rejects.toThrow(ForbiddenException);
                expect(service.addMember).toHaveBeenCalledWith(addMemberDto, 1);
            });

            it('should throw NotFoundException if user not found', async () => {
                const addMemberDto: AddMemberDto = { userId: 2, projectId: 1 };

                jest.spyOn(service, 'addMember').mockRejectedValue(new NotFoundException());

                await expect(controller.addMember(addMemberDto, 1)).rejects.toThrow(NotFoundException);
                expect(service.addMember).toHaveBeenCalledWith(addMemberDto, 1);
            });

            it('should throw InternalServerErrorException if addMember fails', async () => {
                const addMemberDto: AddMemberDto = { userId: 2, projectId: 1 };

                jest.spyOn(service, 'addMember').mockRejectedValue(new InternalServerErrorException());

                await expect(controller.addMember(addMemberDto, 1)).rejects.toThrow(InternalServerErrorException);
                expect(service.addMember).toHaveBeenCalledWith(addMemberDto, 1);
            });
        });

        describe('removeMember', () => {
            it('should throw NotFoundException if project not found', async () => {
                const projectId = 1;
                const memberId = 2;
                jest.spyOn(service, 'removeMember').mockRejectedValue(new NotFoundException());

                await expect(controller.removeMember(projectId, memberId, 1)).rejects.toThrow(NotFoundException);
                expect(service.removeMember).toHaveBeenCalledWith(projectId, memberId, 1);
            });

            it('should throw ForbiddenException if ownerId does not match project owner', async () => {
                const projectId = 1;
                const memberId = 2;

                jest.spyOn(service, 'removeMember').mockRejectedValue(new ForbiddenException());

                await expect(controller.removeMember(projectId, memberId, 1)).rejects.toThrow(ForbiddenException);
                expect(service.removeMember).toHaveBeenCalledWith(projectId, memberId, 1);
            });

            it('should throw NotFoundException if userProject not found', async () => {
                const projectId = 1;
                const memberId = 2;

                jest.spyOn(service, 'removeMember').mockRejectedValue(new NotFoundException());

                await expect(controller.removeMember(projectId, memberId, 1)).rejects.toThrow(NotFoundException);
                expect(service.removeMember).toHaveBeenCalledWith(projectId, memberId, 1);
            });

            it('should throw InternalServerErrorException if removeMember fails', async () => {
                const projectId = 1;
                const memberId = 2;

                jest.spyOn(service, 'removeMember').mockRejectedValue(new InternalServerErrorException());

                await expect(controller.removeMember(projectId, memberId, 1)).rejects.toThrow(InternalServerErrorException);
                expect(service.removeMember).toHaveBeenCalledWith(projectId, memberId, 1);
            });
        });

        describe('update', () => {
            it('should throw NotFoundException if project not found', async () => {
                const projectId = 1;
                const updateProjectDto: UpdateProjectDto = { name: 'Updated Project', description: 'Updated Description' };

                jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

                await expect(controller.update(projectId, updateProjectDto)).rejects.toThrow(NotFoundException);
                expect(service.update).toHaveBeenCalledWith(projectId, updateProjectDto);
            });

            it('should throw InternalServerErrorException if update fails', async () => {
                const projectId = 1;
                const updateProjectDto: UpdateProjectDto = { name: 'Updated Project', description: 'Updated Description' };

                jest.spyOn(service, 'update').mockRejectedValue(new InternalServerErrorException());

                await expect(controller.update(projectId, updateProjectDto)).rejects.toThrow(InternalServerErrorException);
                expect(service.update).toHaveBeenCalledWith(projectId, updateProjectDto);
            });
        });
    });

    describe('detail', () => {
        it('should return a project by ID', async () => {
            const project = { id: 1, name: 'Test Project', description: 'Test Description', ownerId: 1 };

            jest.spyOn(service, 'detail').mockResolvedValue(project);

            const result = await controller.detail(1);

            expect(result).toEqual(project);
            expect(service.detail).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if project is not found', async () => {
            jest.spyOn(service, 'detail').mockRejectedValue(new NotFoundException());

            await expect(controller.detail(1)).rejects.toThrow(NotFoundException);
            expect(service.detail).toHaveBeenCalledWith(1);
        });

        it('should throw InternalServerErrorException if detail retrieval fails', async () => {
            jest.spyOn(service, 'detail').mockRejectedValue(new InternalServerErrorException());

            await expect(controller.detail(1)).rejects.toThrow(InternalServerErrorException);
            expect(service.detail).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('should delete a project by ID', async () => {
            jest.spyOn(service, 'delete').mockResolvedValue(undefined);

            const result = await controller.delete(1);

            expect(result).toBeUndefined();
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if project is not found', async () => {
            jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

            await expect(controller.delete(1)).rejects.toThrow(NotFoundException);
            expect(service.delete).toHaveBeenCalledWith(1);
        });

        it('should throw InternalServerErrorException if deletion fails', async () => {
            jest.spyOn(service, 'delete').mockRejectedValue(new InternalServerErrorException());

            await expect(controller.delete(1)).rejects.toThrow(InternalServerErrorException);
            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});


