import { Injectable } from '@nestjs/common';
import { Publishers } from '@prisma/client';
import { FiltersDto } from 'src/DTO/filters.dto';
import { SortOrder } from 'src/utils/constants';
import { AddPublisherDto } from './dto/add-publisher.dto';
import { EditPublisherDto } from './dto/edit-publisher.dto';
import { PrismaService } from 'prisma/prisma.service';
import { isNaN } from 'lodash';

@Injectable()
export class PublisherService {
  constructor(private readonly prisma: PrismaService) {}

  async countPublishers(search: string): Promise<number> {
    const isSearchByName = isNaN(+search);

    if (isSearchByName) {
      return this.prisma.publishers.count({
        where: search
          ? {
              name: {
                contains: `%${search}`,
              },
            }
          : undefined,
      });
    } else {
      return this.prisma.publishers.count({
        where: search
          ? {
              id: {
                equals: +search,
              },
            }
          : undefined,
      });
    }
  }

  async getListPublishers(query: FiltersDto): Promise<Publishers[]> {
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

    const orderByQuery = sortBy
      ? {
          [sortBy]: sortOrder,
        }
      : {
          createdAt: SortOrder.DESC,
        };

    const skipValue = (page - 1) * pageSize;

    const isSearchByName = isNaN(+search);

    if (isSearchByName) {
      return await this.prisma.publishers.findMany({
        take: pageSize,
        skip: skipValue,
        where: search
          ? {
              name: {
                contains: `%${search}`,
              },
            }
          : undefined,
        orderBy: orderByQuery,
      });
    } else {
      return this.prisma.publishers.findMany({
        take: pageSize,
        skip: skipValue,
        where: search
          ? {
              id: {
                equals: +search,
              },
            }
          : undefined,
        orderBy: orderByQuery,
      });
    }
  }

  async getPublisherByName(name: string): Promise<Publishers> {
    const publisher = await this.prisma.publishers.findUnique({
      where: {
        name,
      },
    });
    return publisher;
  }

  async getPublisherById(id: number): Promise<Publishers> {
    const publisher = await this.prisma.publishers.findUnique({
      where: {
        id,
      },
    });

    return publisher;
  }

  async addPublisher(body: AddPublisherDto): Promise<Publishers> {
    const newPublisher = await this.prisma.publishers.create({
      data: body,
    });

    return newPublisher;
  }

  async editPublisher(id: string, body: EditPublisherDto): Promise<Publishers> {
    const publisher = await this.prisma.publishers.update({
      where: {
        id: +id,
      },
      data: body,
    });

    return publisher;
  }

  async deletePublisher(id: number): Promise<Publishers> {
    const publisher = await this.prisma.publishers.delete({
      where: { id },
    });

    return publisher;
  }

  async deleteMultiple(listIds: number[]): Promise<{ count: number }> {
    const response = await this.prisma.publishers.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });

    return response;
  }

  async deleteAllPublishers(): Promise<{ count: number }> {
    const response = await this.prisma.publishers.deleteMany({});

    return response;
  }
}
