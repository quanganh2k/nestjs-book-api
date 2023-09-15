import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FiltersDto } from 'src/DTO/filters.dto';
import { AddUserDto } from './dto/add-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { EditUserDto } from './dto/edit-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getListUsers(@Query() query: FiltersDto) {
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
    const listUsers = await this.userService.getListUsers(query);
    const totalUsers = await this.userService.countUsers(search);
    const totalPage = Math.ceil(totalUsers / pageSize);

    return {
      data: listUsers,
      paging: {
        page,
        pageSize,
        nextPage: page + 1 <= totalPage ? page + 1 : null,
        prevPage: page - 1 >= 1 ? page - 1 : null,
        totalPage,
        total: totalUsers,
      },
    };
  }

  @Get(':id')
  async getUserDetails(@Param() params: { id: string }) {
    const user = await this.userService.getUserDetails(+params.id);

    if (!user) {
      throw new NotFoundException();
    }

    delete user.password;

    return {
      data: user,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addUser(@Body() body: AddUserDto) {
    const { email, password, firstName, lastName } = body;
    const foundUser = await this.userService.getUserByEmail(email);

    console.log('__found', foundUser);

    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.authService.hashPassword(password);

    const nextBody = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    };

    const user = await this.userService.addUser(nextBody);

    return {
      message: 'Create user successfully',
      data: user,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async editUser(@Param('id') id: string, @Body() body: EditUserDto) {
    const foundUser = await this.userService.getUserById(+id);

    if (!foundUser) {
      throw new BadRequestException('User does not exist');
    }

    const nextBody: EditUserDto = {};
    for (const key in body) {
      if (body[key] !== foundUser[key]) {
        if (key === 'password') {
          const isMatchedPassword = await this.authService.comparePassword({
            password: body[key],
            hash: foundUser.password,
          });
          if (!isMatchedPassword) {
            nextBody[key] = await this.authService.hashPassword(body[key]);
          }
        } else {
          nextBody[key] = body[key];
        }
      }
    }

    if (nextBody.email) {
      const otherUser = await this.userService.getUserByEmail(nextBody.email);

      if (otherUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const user = await this.userService.editUser(id, nextBody);

    return {
      message: 'Edit user successfully',
      data: user,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string) {
    const userFound = await this.userService.getUserById(+id);

    if (!userFound) {
      throw new BadRequestException('User does not exist');
    }

    const user = await this.userService.deleteUser(id);

    return {
      message: 'Delete user successfully',
      data: user,
    };
  }

  @Patch('/change-password/:id')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('id') id: string,
    @Request() req,
    @Body() body: ChangePasswordDto,
  ) {
    const userIdFromRequest = req.user.id;

    const foundUser = await this.userService.getUserById(+id);

    if (!foundUser) {
      throw new NotFoundException();
    }

    if (foundUser.id !== userIdFromRequest) {
      throw new ForbiddenException();
    }

    const isMatchedPassword = await this.authService.comparePassword({
      password: body.oldPassword,
      hash: foundUser.password,
    });

    if (!isMatchedPassword) {
      throw new BadRequestException('Old passwords do not match');
    }

    const hashedPassword = await this.authService.hashPassword(body.password);
    const nextBody = {
      password: hashedPassword,
    };

    await this.userService.editUser(id, nextBody);

    return {
      message: 'Change password successfully',
    };
  }
}
