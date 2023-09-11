import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { FiltersDto } from 'src/DTO/filters.dto';
import { AddUserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { SortOrder } from 'src/utils/constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async countUsers(search: string): Promise<number> {
    return this.prisma.users.count({
      where: search
        ? {
            OR: [
              {
                firstName: {
                  contains: `%${search}`,
                },
              },
              {
                lastName: {
                  contains: `%${search}`,
                },
              },
            ],
          }
        : undefined,
    });
  }

  async getListUsers(query: FiltersDto): Promise<Omit<Users, 'password'>[]> {
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

    const skipValue = (page - 1) * pageSize;

    const response = await this.prisma.users.findMany({
      take: pageSize,
      skip: skipValue,
      where: search
        ? {
            OR: [
              {
                firstName: {
                  contains: `%${search}`,
                },
              },
              {
                lastName: {
                  contains: `%${search}`,
                },
              },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: SortOrder.DESC,
      },
    });

    return response;
  }

  async getUserDetails(id: number): Promise<Users> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });

    return foundUser;
  }

  async getUserById(id: number): Promise<Users> {
    const foundUser = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });

    return foundUser;
  }

  async getUserByEmail(email: string): Promise<Omit<Users, 'password'>> {
    const foundUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (foundUser) {
      delete foundUser.password;
    }

    return foundUser;
  }

  async addUser(body: AddUserDto): Promise<Omit<Users, 'password'>> {
    const { email, password, firstName, lastName } = body;

    const newUser = await this.prisma.users.create({
      data: {
        email,
        password,
        firstName,
        lastName,
      },
    });

    delete newUser.password;

    return newUser;
  }

  async editUser(
    id: string,
    body: EditUserDto,
  ): Promise<Omit<Users, 'password'>> {
    const user = await this.prisma.users.update({
      where: {
        id: +id,
      },
      data: body,
    });

    delete user.password;

    return user;
  }

  async deleteUser(id: string): Promise<Omit<Users, 'password'>> {
    const user = await this.prisma.users.delete({
      where: {
        id: +id,
      },
    });

    delete user.password;
    return user;
  }
}
