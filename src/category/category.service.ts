import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EditCategoryDto } from './dto/edit-category.dto';
import { Categories } from '@prisma/client';
import { AddCategoryDto } from './dto/add-category.dto';
import { FiltersDto } from 'src/DTO/filters.dto';
import { isNaN } from 'lodash';
import { SortOrder } from 'src/utils/constants';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async countCategories(search: string): Promise<number> {
    const isSearchByName = isNaN(+search);

    if (isSearchByName) {
      return this.prisma.categories.count({
        where: search
          ? {
              name: {
                contains: `%${search}`,
              },
            }
          : undefined,
      });
    } else {
      return this.prisma.categories.count({
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

  async getListCategories(query: FiltersDto): Promise<Categories[]> {
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
      return await this.prisma.categories.findMany({
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
      return this.prisma.categories.findMany({
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

  async getCategoryByName(name: string): Promise<Categories> {
    const category = await this.prisma.categories.findUnique({
      where: {
        name,
      },
    });
    return category;
  }

  async getCategoryById(id: number): Promise<Categories> {
    const category = await this.prisma.categories.findUnique({
      where: { id },
    });

    return category;
  }

  async addCategory(body: AddCategoryDto): Promise<Categories> {
    const newCategory = await this.prisma.categories.create({
      data: body,
    });

    return newCategory;
  }

  async editCategory(id: string, body: EditCategoryDto): Promise<Categories> {
    const category = await this.prisma.categories.update({
      where: {
        id: +id,
      },
      data: body,
    });

    return category;
  }

  async deleteCategory(id: number): Promise<Categories> {
    const category = await this.prisma.categories.delete({
      where: { id },
    });

    return category;
  }

  async deleteMultiple(listIds: number[]): Promise<{ count: number }> {
    const response = await this.prisma.categories.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });

    return response;
  }

  async deleteAllCategories(): Promise<{ count: number }> {
    const response = await this.prisma.categories.deleteMany({});

    return response;
  }
}
