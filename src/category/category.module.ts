import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { BookService } from 'src/book/book.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, JwtStrategy, BookService],
})
export class CategoryModule {}
