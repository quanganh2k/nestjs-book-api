import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { FiltersDto } from 'src/DTO/filters.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AddPublisherDto } from './dto/add-publisher.dto';
import { EditPublisherDto } from './dto/edit-publisher.dto';
import { BookService } from 'src/book/book.service';

@Controller('publisher')
export class PublisherController {
  constructor(
    private readonly publisherService: PublisherService,
    private readonly bookService: BookService,
  ) {}

  @Get()
  async getListPublishers(@Query() query: FiltersDto) {
    const page =
      query &&
      query.page &&
      Number.isSafeInteger(Number(query.page)) &&
      Number(query.page) > 0
        ? Number(query.page)
        : 1;

    const pageSize =
      query &&
      query.pageSize &&
      Number.isSafeInteger(Number(query.pageSize)) &&
      Number(query.pageSize) > 0
        ? Number(query.pageSize)
        : 10;

    const search = query && query.search ? query.search : '';

    const listPublishers = await this.publisherService.getListPublishers(query);
    const totalPublishers = await this.publisherService.countPublishers(search);
    const totalPage = Math.ceil(totalPublishers / pageSize);

    return {
      data: listPublishers,
      paging: {
        page,
        pageSize,
        nextPage: page + 1 <= totalPage ? page + 1 : null,
        prevPage: page - 1 >= 1 ? page - 1 : null,
        totalPage,
        total: totalPublishers,
      },
    };
  }

  @Get(':id')
  async getPublisherDetails(@Param('id') id: string) {
    const publisher = await this.publisherService.getPublisherById(+id);

    if (!publisher) {
      throw new NotFoundException();
    }

    return {
      data: publisher,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addPublisher(@Body() body: AddPublisherDto) {
    const foundPublisher = await this.publisherService.getPublisherByName(
      body.name,
    );

    if (foundPublisher) {
      throw new BadRequestException('Publisher already exists');
    }

    const publisher = await this.publisherService.addPublisher(body);

    return {
      message: 'Create publisher successfully',
      data: publisher,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async editPublisher(@Param('id') id: string, @Body() body: EditPublisherDto) {
    const foundPublisher = await this.publisherService.getPublisherById(+id);

    if (!foundPublisher) {
      throw new BadRequestException('Publisher does not exist');
    }

    const nextBody: EditPublisherDto = {};

    for (const key in body) {
      if (body[key] !== foundPublisher[key]) {
        nextBody[key] = body[key];
      }
    }

    if (nextBody.name) {
      const otherPublisher = await this.publisherService.getPublisherByName(
        nextBody.name,
      );

      if (otherPublisher) {
        throw new BadRequestException('Publisher name already exists');
      }
    }

    const publisher = await this.publisherService.editPublisher(id, nextBody);

    return {
      message: 'Edit pulisher successfully',
      data: publisher,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePublisher(@Param('id') id: string) {
    await this.bookService.updateBeforeDeletePrimaryKey('publisherId', +id);

    const publisher = await this.publisherService.deletePublisher(+id);

    return {
      message: 'Delete publisher successfully',
      data: publisher,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteMultiple(@Query('listIds') listIds: string[]) {
    if (listIds) {
      const newListIds = listIds.map((el) => +el);
      await this.bookService.updateBeforeDeleteMultiplePrimaryKey(
        'publisherId',
        newListIds,
      );
      const response = await this.publisherService.deleteMultiple(newListIds);
      return {
        message: 'Delete successfully',
        data: response,
      };
    } else {
      await this.bookService.deleteAllImages();
      await this.bookService.deleteAllBooks();
      const response = await this.publisherService.deleteAllPublishers();
      return {
        message: 'Delete successfully',
        data: response,
      };
    }
  }
}
