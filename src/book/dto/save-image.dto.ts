import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveImageDto {
  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @IsNumber()
  bookId: number;
}
