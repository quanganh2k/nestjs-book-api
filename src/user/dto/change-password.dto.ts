import { PartialType } from '@nestjs/mapped-types';
import { AddUserDto } from './add-user.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto extends PartialType(AddUserDto) {
  @IsNotEmpty()
  @IsString()
  @Length(8)
  oldPassword: string;
}
