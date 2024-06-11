import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { CreateTagDto } from './create-tag.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TagController', () => {
    let controller: TagController;
    let service: TagService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TagController],
            providers: [
                {
                    provide: TagService,
                    useValue: {
                        create: jest.fn(),
                        detail: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<TagController>(TagController);
        service = module.get<TagService>(TagService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createTag', () => {
        it('should create a tag', async () => {
            const createTagDto: CreateTagDto = { title: 'Test Tag' };
            const createdTag = { id: 1, ...createTagDto };

            jest.spyOn(service, 'create').mockResolvedValue(createdTag);

            const result = await controller.create(createTagDto);

            expect(result).toEqual(createdTag);
            expect(service.create).toHaveBeenCalledWith(createTagDto);
        });
    });

    describe('getTagById', () => {
        it('should return a tag by ID', async () => {
            const tagId = 1;
            const tag = { id: tagId, title: 'Test Tag' };

            jest.spyOn(service, 'detail').mockResolvedValue(tag);

            const result = await controller.detail(tagId);

            expect(result).toEqual(tag);
            expect(service.detail).toHaveBeenCalledWith(tagId);
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;

            jest.spyOn(service, 'detail').mockRejectedValue(new NotFoundException());

            await expect(controller.detail(tagId)).rejects.toThrow(NotFoundException);
            expect(service.detail).toHaveBeenCalledWith(tagId);
        });
    });

    describe('updateTag', () => {
        it('should update a tag', async () => {
            const tagId = 1;
            const updateTagDto: CreateTagDto = { title: 'Updated Tag' };
            const updatedTag = { id: tagId, ...updateTagDto };

            jest.spyOn(service, 'update').mockResolvedValue(updatedTag);

            const result = await controller.update(tagId, updateTagDto);

            expect(result).toEqual(updatedTag);
            expect(service.update).toHaveBeenCalledWith(tagId, updateTagDto);
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;
            const updateTagDto: CreateTagDto = { title: 'Updated Tag' };

            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

            await expect(controller.update(tagId, updateTagDto)).rejects.toThrow(NotFoundException);
            expect(service.update).toHaveBeenCalledWith(tagId, updateTagDto);
        });
    });

    describe('deleteTag', () => {
        it('should delete a tag', async () => {
            const tagId = 1;
            const deleteMessage = { message: 'Tag deleted successfully' };

            jest.spyOn(service, 'delete').mockResolvedValue(deleteMessage);

            const result = await controller.delete(tagId);

            expect(result).toEqual(deleteMessage);
            expect(service.delete).toHaveBeenCalledWith(tagId);
        });

        it('should throw NotFoundException if tag is not found', async () => {
            const tagId = 1;

            jest.spyOn(service, 'delete').mockRejectedValue(new NotFoundException());

            await expect(controller.delete(tagId)).rejects.toThrow(NotFoundException);
            expect(service.delete).toHaveBeenCalledWith(tagId);
        });
    });

    describe('findAll', () => {
        it('should return all tags with pagination', async () => {
            const page = 0;
            const size = 10;
            const tags = [{ id: 1, title: 'Tag 1' }, { id: 2, title: 'Tag 2' }];
            const total = 2;

            jest.spyOn(service, 'findAll').mockResolvedValue({ data: tags, total, page, size });

            const result = await controller.findAll(page, size);

            expect(result).toEqual({ data: tags, total, page, size });
            expect(service.findAll).toHaveBeenCalledWith(page, size);
        });

        it('should throw BadRequestException if page or size parameters are invalid', async () => {
            const invalidPage = -1;
            const invalidSize = 0;

            jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

            await expect(controller.findAll(invalidPage, invalidSize)).rejects.toThrow(BadRequestException);
        });
    });

});
