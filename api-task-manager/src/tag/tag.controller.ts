import {ApiOperation, ApiTags, ApiParam, ApiResponse, ApiQuery} from '@nestjs/swagger';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post, Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CreateTagDto } from './create-tag.dto';
import { TagService } from './tag.service';

@ApiTags('Tag')
@Controller('tag')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Post('/create-tag')
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiResponse({ status: 201, description: 'Tag created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() createTagDto: CreateTagDto) {
        return await this.tagService.create(createTagDto);
    }

    @Get('/tag/:tagId')
    @ApiOperation({ summary: 'Get a tag by ID' })
    @ApiParam({ name: 'tagId', description: 'The ID of the tag to retrieve' })
    @ApiResponse({ status: 200, description: 'Tag retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    async detail(@Param('tagId') tagId: number) {
        return await this.tagService.detail(tagId);
    }

    @Patch('/tag/:tagId')
    @ApiOperation({ summary: 'Update a tag by ID' })
    @ApiParam({ name: 'tagId', description: 'The ID of the tag to update' })
    @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(@Param('tagId') tagId: number, @Body() updateTagDto: CreateTagDto) {
        return await this.tagService.update(tagId, updateTagDto);
    }

    @Delete('/tag/:tagId')
    @ApiOperation({ summary: 'Delete a tag by ID' })
    @ApiParam({ name: 'tagId', description: 'The ID of the tag to delete' })
    @ApiResponse({ status: 200, description: 'Tag deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    async delete(@Param('tagId') tagId: number) {
        return await this.tagService.delete(tagId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tags with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'size', required: false, type: Number, description: 'Number of items per page' })
    @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async findAll(
        @Query('page') page: number = 0,
        @Query('size') size: number = 10
    ) {
        if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
            throw new BadRequestException('Invalid page or size parameters');
        }
        return await this.tagService.findAll(page, size);
    }
}
