import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma.service';
import { CreateTagDto } from './create-tag.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('TagService', () => {
    let service: TagService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagService,
                {
                    provide: PrismaService,
                    useValue: {
                        tag: {
                            create: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<TagService>(TagService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTag', () => {
        it('should create a tag', async () => {
            const createTagDto: CreateTagDto = {
                title: 'Test Tag',
            };

            const createdTag = {
                id: 1,
                title: 'Test Tag',
            };

            (prisma.tag.create as jest.Mock).mockResolvedValue(createdTag);

            const result = await service.create(createTagDto);

            expect(result).toEqual(createdTag);
            expect(prisma.tag.create).toHaveBeenCalledWith({
                data: {
                    title: createTagDto.title,
                },
            });
        });

        it('should throw InternalServerErrorException when creation fails', async () => {
            const createTagDto: CreateTagDto = {
                title: 'Test Tag',
            };

            (prisma.tag.create as jest.Mock).mockRejectedValueOnce(new Error('Create failed'));

            await expect(service.create(createTagDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getTagById', () => {
        it('should return a tag by id', async () => {
            const tagId = 1;
            const tag = {
                id: tagId,
                title: 'Test Tag',
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(tag);

            const result = await service.detail(tagId);

            expect(result).toEqual(tag);
            expect(prisma.tag.findUnique).toHaveBeenCalledWith({
                where: { id: tagId },
            });
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.detail(tagId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTag', () => {
        it('should update a tag', async () => {
            const tagId = 1;
            const updateTagDto: CreateTagDto = {
                title: 'Updated Tag',
            };

            const existingTag = {
                id: tagId,
                title: 'Test Tag',
            };

            const updatedTag = {
                ...existingTag,
                ...updateTagDto,
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(existingTag);
            (prisma.tag.update as jest.Mock).mockResolvedValue(updatedTag);

            const result = await service.update(tagId, updateTagDto);

            expect(result).toEqual(updatedTag);
            expect(prisma.tag.findUnique).toHaveBeenCalledWith({ where: { id: tagId } });
            expect(prisma.tag.update).toHaveBeenCalledWith({
                where: { id: tagId },
                data: {
                    title: updateTagDto.title,
                },
            });
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;
            const updateTagDto: CreateTagDto = {
                title: 'Updated Tag',
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.update(tagId, updateTagDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException when update fails', async () => {
            const tagId = 1;
            const updateTagDto: CreateTagDto = {
                title: 'Updated Tag',
            };

            const existingTag = {
                id: tagId,
                title: 'Test Tag',
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(existingTag);
            (prisma.tag.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

            await expect(service.update(tagId, updateTagDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteTag', () => {
        it('should delete a tag', async () => {
            const tagId = 1;
            const tag = {
                id: tagId,
                title: 'Test Tag',
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(tag);
            (prisma.tag.delete as jest.Mock).mockResolvedValue(tag);

            const result = await service.delete(tagId);

            expect(result).toEqual({ message: 'Tag deleted successfully' });
            expect(prisma.tag.findUnique).toHaveBeenCalledWith({ where: { id: tagId } });
            expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: tagId } });
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.delete(tagId)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException when deletion fails', async () => {
            const tagId = 1;
            const tag = {
                id: tagId,
                title: 'Test Tag',
            };

            (prisma.tag.findUnique as jest.Mock).mockResolvedValue(tag);
            (prisma.tag.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

            await expect(service.delete(tagId)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('should return all tags with pagination', async () => {
            const tags = [
                { id: 1, title: 'Test Tag 1' },
                { id: 2, title: 'Test Tag 2' },
            ];
            const total = 2;

            (prisma.tag.findMany as jest.Mock).mockResolvedValue(tags);
            (prisma.tag.count as jest.Mock).mockResolvedValue(total);

            const result = await service.findAll(0, 10);

            expect(result).toEqual({
                data: tags,
                total: total,
                page: 0,
                size: 10,
            });
            expect(prisma.tag.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10,
            });
            expect(prisma.tag.count).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException when retrieval fails', async () => {
            (prisma.tag.findMany as jest.Mock).mockRejectedValueOnce(new Error('FindMany failed'));

            await expect(service.findAll(0, 10)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
