import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  controllers: [BookController],
  providers: [BookService, JwtStrategy],
})
export class BookModule {}
