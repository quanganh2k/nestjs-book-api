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
import { CategoryService } from './category.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AddCategoryDto } from './dto/add-category.dto';
import { EditCategoryDto } from './dto/edit-category.dto';
import { FiltersDto } from 'src/DTO/filters.dto';
import { BookService } from 'src/book/book.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly bookService: BookService,
  ) {}

  @Get()
  async getListCategory(@Query() query: FiltersDto) {
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

    const listCategories = await this.categoryService.getListCategories(query);
    const totalCategories = await this.categoryService.countCategories(search);
    const totalPage = Math.ceil(totalCategories / pageSize);

    return {
      data: listCategories,
      paging: {
        page,
        pageSize,
        nextPage: page + 1 <= totalPage ? page + 1 : null,
        prevPage: page - 1 >= 1 ? page - 1 : null,
        totalPage,
        total: totalCategories,
      },
    };
  }

  @Get(':id')
  async getCategoryDetails(@Param('id') id: string) {
    const category = await this.categoryService.getCategoryById(+id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addCategory(@Body() body: AddCategoryDto) {
    const foundCategory = await this.categoryService.getCategoryByName(
      body.name,
    );

    if (foundCategory) {
      throw new BadRequestException('Category already exists');
    }

    const category = await this.categoryService.addCategory(body);

    return {
      message: 'Create category successfully',
      data: category,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editCategory(@Param('id') id: string, @Body() body: EditCategoryDto) {
    const foundCategory = await this.categoryService.getCategoryById(+id);

    if (!foundCategory) {
      throw new BadRequestException('Category does not exist');
    }

    const nextBody: EditCategoryDto = {};
    for (const key in body) {
      if (body[key] !== foundCategory[key]) {
        nextBody[key] = body[key];
      }
    }

    const otherCategory = await this.categoryService.getCategoryByName(
      nextBody.name,
    );

    if (otherCategory) {
      throw new BadRequestException('Category name already exists');
    }

    const category = await this.categoryService.editCategory(id, body);

    return {
      message: 'Edit category successfully',
      data: category,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id') id: string) {
    await this.bookService.updateBeforeDeletePrimaryKey('categoryId', +id);

    const category = await this.categoryService.deleteCategory(+id);

    return {
      message: 'Delete publisher succesfully',
      data: category,
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteMultiple(@Query('listIds') listIds: string[]) {
    if (listIds) {
      const newListIds = listIds.map((el) => +el);
      await this.bookService.updateBeforeDeleteMultiplePrimaryKey(
        'categoryId',
        newListIds,
      );
      const response = await this.categoryService.deleteMultiple(newListIds);
      return {
        message: 'Delete successfully',
        data: response,
      };
    } else {
      await this.bookService.deleteAllImages();
      await this.bookService.deleteAllBooks();
      const response = await this.categoryService.deleteAllCategories();
      return {
        message: 'Delete successfully',
        data: response,
      };
    }
  }
}
