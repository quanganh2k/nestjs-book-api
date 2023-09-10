import { IsNotEmpty, IsString } from 'class-validator';

export class AddPublisherDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  information: string;
}
