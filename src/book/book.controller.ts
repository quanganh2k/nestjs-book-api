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
import { BookService } from './book.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AddBookDto } from './dto/add-book.dto';
import { EditBookDto } from './dto/edit-book.dto';
import { FiltersDto } from 'src/DTO/filters.dto';
import { isArray } from 'lodash';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getListBooks(@Query() query: FiltersDto) {
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

    const listBooks = await this.bookService.getListBooks(query);
    const totalBooks = await this.bookService.countBooks(query);
    const totalPage = Math.ceil(totalBooks / pageSize);

    return {
      data: listBooks,
      paging: {
        page,
        pageSize,
        nextPage: page + 1 <= totalPage ? page + 1 : null,
        prevPage: page - 1 >= 1 ? page - 1 : null,
        totalPage,
        total: totalBooks,
      },
    };
  }

  @Get(':id')
  async getBookDetails(@Param('id') id: string) {
    const book = await this.bookService.getBookById(+id);

    if (!book) {
      throw new NotFoundException();
    }

    const images = await this.bookService.getImageByBookId(book.id);

    const nextBook = {
      ...book,
      images: images.map((el) => el.source),
    };

    return nextBook;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addBook(@Body() body: AddBookDto) {
    const foundBook = await this.bookService.getBookByName(body.name);

    if (foundBook) {
      throw new BadRequestException('Book already exists');
    }

    let book;
    let nextBody;
    if (body.images && isArray(body.images) && body.images.length > 0) {
      const { images, ...rest } = body;
      nextBody = {
        ...rest,
      };

      book = await this.bookService.addBook(nextBody);

      const nextImages = images.map((elm) => {
        return {
          source: elm,
          bookId: book.id,
        };
      });

      await Promise.all(
        nextImages.map((img) => this.bookService.saveImage(img)),
      );
    } else {
      nextBody = { ...body };
      book = await this.bookService.addBook(nextBody);
    }

    return {
      message: 'Create book successfully',
      data: book,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async editBook(@Param('id') id: string, @Body() body: EditBookDto) {
    const foundBook = await this.bookService.getBookById(+id);

    if (!foundBook) {
      throw new BadRequestException('Book does not exist');
    }
    const bookFromDb = await this.bookService.getBookByName(foundBook.name);

    const nextBody: EditBookDto = {};
    for (const key in body) {
      if (isArray(body[key])) {
        if (JSON.stringify(body[key]) !== JSON.stringify(bookFromDb[key])) {
          nextBody[key] = body[key];
        }
      } else {
        if (body[key] !== bookFromDb[key]) {
          nextBody[key] = body[key];
        }
      }
    }

    if (nextBody.name) {
      const otherBook = await this.bookService.getBookByName(nextBody.name);
      if (otherBook) {
        throw new BadRequestException('Book already exists');
      }
    }

    let book;
    if (
      nextBody.images &&
      isArray(nextBody.images) &&
      nextBody.images.length > 0
    ) {
      const { images, ...bodyEdit } = nextBody;
      book = await this.bookService.editBook(id, bodyEdit);

      const imagesFromDb = await this.bookService.getImageByBookId(+id);

      const imageNeedToSave = images.find((elm) => {
        const foundImage = imagesFromDb.find((el) => el.source === elm);
        if (!foundImage) {
          return elm;
        }
      });

      const imageOrigin = imagesFromDb.find((elm) => {
        const foundImage = images.find((el) => el === elm.source);

        if (!foundImage) {
          return elm;
        }
      });

      await this.bookService.editImage(imageOrigin.id, imageNeedToSave);
    } else {
      book = await this.bookService.editBook(id, nextBody);
    }

    return {
      message: 'Edit book successfully',
      data: book,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteBook(@Param('id') id: string) {
    await this.bookService.deleteImage(+id);

    const response = await this.bookService.deleteBook(+id);

    return {
      message: 'Delete book successfully',
      data: response,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteMultiple(@Query('listIds') listIds: string[]) {
    if (listIds) {
      const newListIds = listIds.map((el) => +el);
      const imagesDeleted =
        await this.bookService.deleteMultipleImage(newListIds);

      console.log('>>>>>newewew', imagesDeleted);
      const response = await this.bookService.deleteMultiple(newListIds);

      return {
        message: 'Delete successfully',
        data: response,
      };
    } else {
      await this.bookService.deleteAllImages();
      const response = await this.bookService.deleteAllBooks();
      return {
        message: 'Delete succesfully',
        data: response,
      };
    }
  }
}
