import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { IMAGE_URL, MAX_FILE_SIZE, MAX_TOTAL_SIZE } from 'src/utils/constants';
import { Response } from 'express';
import { isArray } from 'lodash';

@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            fileName.split(' ').join('_') +
            '_' +
            Date.now() +
            '.' +
            fileExtension;

          cb(null, newFileName);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE, // 1MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Invalid file format'), false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File cannot be empty');
    } else {
      const response = {
        url: `${IMAGE_URL}/${file.filename}`,
      };
      return response;
    }
  }

  @Post('/multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            fileName.split(' ').join('_') +
            '_' +
            Date.now() +
            '.' +
            fileExtension;

          cb(null, newFileName);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE, // 1MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(null, false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadMultipleImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (isArray(files) && files.length === 0) {
      throw new BadRequestException('Files cannot be empty');
    }

    const totalSizeFilesUpload = files.reduce(
      (acc, file) => acc + file.size,
      0,
    );

    if (totalSizeFilesUpload > MAX_TOTAL_SIZE) {
      throw new BadRequestException(
        'Total size of files upload exceeds the limit',
      );
    }

    const response = [];
    files.forEach((file) => {
      response.push({
        url: `${IMAGE_URL}/${file.filename}`,
      });
    });

    return response;
  }

  @Get(':filename')
  async getImage(@Param('filename') filename, @Res() res: Response) {
    res.sendFile(filename, { root: './uploads' });
  }
}
