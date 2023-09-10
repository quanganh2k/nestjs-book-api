import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { PublisherModule } from './publisher/publisher.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    CategoryModule,
    PublisherModule,
    UploadFileModule,
    BookModule,
  ],
})
export class AppModule {}
