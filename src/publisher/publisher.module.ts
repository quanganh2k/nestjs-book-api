import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { BookService } from 'src/book/book.service';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService, JwtStrategy, BookService],
})
export class PublisherModule {}
