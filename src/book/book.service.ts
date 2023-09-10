import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddBookDto } from './dto/add-book.dto';
import { Books, Images } from '@prisma/client';
import { EditBookDto } from './dto/edit-book.dto';
import { FiltersDto } from 'src/DTO/filters.dto';
import { SortOrder } from 'src/utils/constants';
import { SaveImageDto } from './dto/save-image.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async countBooks(
    query: Pick<FiltersDto, 'search' | 'priceFrom' | 'priceTo'>,
  ): Promise<number> {
    const search = query && query.search ? query.search : '';

    const priceFrom =
      query &&
      query.priceFrom &&
      Number.isSafeInteger(Number(query.priceFrom)) &&
      Number(query.priceFrom) >= 0
        ? Number(query.priceFrom)
        : undefined;

    const priceTo =
      query &&
      query.priceTo &&
      Number.isSafeInteger(Number(query.priceTo)) &&
      Number(query.priceTo) > Number(query.priceFrom || 0)
        ? Number(query.priceTo)
        : undefined;

    const searchQuery = search
      ? {
          name: {
            contains: `%${search}`,
          },
        }
      : undefined;

    let filterPriceQuery;

    if (priceFrom && !priceTo) {
      filterPriceQuery = {
        price: {
          gte: priceFrom,
        },
      };
    }

    if (!priceFrom && priceTo) {
      filterPriceQuery = {
        price: {
          lte: priceTo,
        },
      };
    }

    if (priceFrom && priceTo) {
      filterPriceQuery = [
        {
          price: {
            gte: priceFrom,
          },
        },
        {
          price: {
            lte: priceTo,
          },
        },
      ];
    }

    if (!priceFrom && !priceTo) {
      filterPriceQuery = undefined;
    }

    const response = await this.prisma.books.count({
      where: {
        AND:
          priceFrom && priceTo
            ? [searchQuery, { price: { AND: filterPriceQuery } }]
            : [searchQuery, filterPriceQuery],
      },
    });

    return response;
  }

  async getListBooks(query: FiltersDto): Promise<Books[]> {
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
    const sortBy = query && query.sortBy ? query.sortBy : '';
    const sortOrder =
      query && query.sortOrder ? query.sortOrder : SortOrder.DESC;

    const priceFrom =
      query &&
      query.priceFrom &&
      Number.isSafeInteger(Number(query.priceFrom)) &&
      Number(query.priceFrom) >= 0
        ? Number(query.priceFrom)
        : undefined;

    const priceTo =
      query &&
      query.priceTo &&
      Number.isSafeInteger(Number(query.priceTo)) &&
      Number(query.priceTo) > Number(query.priceFrom || 0)
        ? Number(query.priceTo)
        : undefined;

    const orderByQuery = sortBy
      ? {
          [sortBy]: sortOrder,
        }
      : {
          createdAt: SortOrder.DESC,
        };

    const searchQuery = search
      ? {
          name: {
            contains: `%${search}`,
          },
        }
      : undefined;

    let filterPriceQuery;

    if (priceFrom && !priceTo) {
      filterPriceQuery = {
        price: {
          gte: priceFrom,
        },
      };
    }

    if (!priceFrom && priceTo) {
      filterPriceQuery = {
        price: {
          lte: priceTo,
        },
      };
    }

    if (priceFrom && priceTo) {
      filterPriceQuery = [
        {
          price: {
            gte: priceFrom,
          },
        },
        {
          price: {
            lte: priceTo,
          },
        },
      ];
    }

    if (!priceFrom && !priceTo) {
      filterPriceQuery = undefined;
    }

    const skipValue = (page - 1) * pageSize;

    const response = await this.prisma.books.findMany({
      take: pageSize,
      skip: skipValue,
      where: {
        AND:
          priceFrom && priceTo
            ? [searchQuery, { price: { AND: filterPriceQuery } }]
            : [searchQuery, filterPriceQuery],
      },
      orderBy: orderByQuery,
      include: {
        Images: true,
        category: true,
        publisher: true,
      },
    });

    return response;
  }

  async addBook(body: AddBookDto): Promise<Books> {
    const newBook = await this.prisma.books.create({
      data: body,
    });

    return newBook;
  }

  async editBook(id: string, body: EditBookDto): Promise<Books> {
    const book = await this.prisma.books.update({
      where: {
        id: +id,
      },
      data: body,
    });

    return book;
  }

  async updateBeforeDeletePrimaryKey(
    fieldUpdate: string,
    value: number,
  ): Promise<{ count: number }> {
    const response = await this.prisma.books.updateMany({
      where: {
        [fieldUpdate]: value,
      },
      data: {
        [fieldUpdate]: null,
      },
    });

    return response;
  }

  async updateBeforeDeleteMultiplePrimaryKey(
    fieldUpdate: string,
    value: number[],
  ): Promise<{ count: number }> {
    const response = await this.prisma.books.updateMany({
      where: {
        [fieldUpdate]: {
          in: value,
        },
      },
      data: {
        [fieldUpdate]: null,
      },
    });

    return response;
  }

  async deleteBook(id: number): Promise<Books> {
    const book = await this.prisma.books.delete({
      where: { id },
    });

    return book;
  }

  async deleteMultiple(listIds: number[]): Promise<{ count: number }> {
    const response = await this.prisma.books.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });

    return response;
  }

  async deleteAllBooks(): Promise<{ count: number }> {
    const response = await this.prisma.books.deleteMany({});
    return response;
  }

  async getBookByName(name: string): Promise<Books> {
    const book = await this.prisma.books.findUnique({
      where: {
        name,
      },
    });

    return book;
  }

  async getBookById(id: number): Promise<Books> {
    const book = await this.prisma.books.findUnique({
      where: { id },
      include: {
        publisher: true,
        category: true,
      },
    });

    return book;
  }

  async saveImage(body: SaveImageDto): Promise<Images> {
    const response = await this.prisma.images.create({
      data: body,
    });

    return response;
  }

  async editImage(id: number, source: string): Promise<Images> {
    const response = await this.prisma.images.update({
      where: {
        id,
      },
      data: {
        source,
      },
    });

    return response;
  }

  async deleteImage(id: number): Promise<{ count: number }> {
    return this.prisma.images.deleteMany({
      where: {
        bookId: id,
      },
    });
  }

  async deleteMultipleImage(listIds: number[]): Promise<{ count: number }> {
    return this.prisma.images.deleteMany({
      where: {
        bookId: {
          in: listIds,
        },
      },
    });
  }

  async deleteAllImages(): Promise<{ count: number }> {
    return this.prisma.images.deleteMany({});
  }

  async getImageByBookId(bookId: number): Promise<Images[]> {
    const response = await this.prisma.images.findMany({
      where: {
        bookId,
      },
    });

    return response;
  }
}
