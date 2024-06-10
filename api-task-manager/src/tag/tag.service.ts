import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTagDto } from './create-tag.dto';

@Injectable()
export class TagService {
    constructor(private prisma: PrismaService) {}

    async createTag(createTagDto: CreateTagDto) {
        try {
            return await this.prisma.tag.create({
                data: {
                    title: createTagDto.title,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to create tag: ${error.message}`);
        }
    }

    async getTagById(tagId: number) {
        const tag = await this.prisma.tag.findUnique({
            where: { id: Number(tagId) },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async updateTag(tagId: number, updateTagDto: CreateTagDto) {
        const tag = await this.prisma.tag.findUnique({
            where: { id: Number(tagId) },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        try {
            return await this.prisma.tag.update({
                where: { id: Number(tagId) },
                data: {
                    title: updateTagDto.title,
                },
            });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to update tag: ${error.message}`);
        }
    }

    async deleteTag(tagId: number) {
        const tag = await this.prisma.tag.findUnique({
            where: { id: Number(tagId) },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        try {
            await this.prisma.tag.delete({
                where: { id: Number(tagId) },
            });
            return { message: 'Tag deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to delete tag: ${error.message}`);
        }
    }

    async findAll(page: number, size: number) {
        const skip = page * size;

        try {
            const [tags, total] = await Promise.all([
                this.prisma.tag.findMany({
                    skip: skip,
                    take: Number(size),
                }),
                this.prisma.tag.count(),
            ]);

            return {
                data: tags,
                total,
                page,
                size,
            };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve tags: ${error.message}`);
        }
    }
}
