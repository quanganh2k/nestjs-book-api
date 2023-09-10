import { PartialType } from '@nestjs/mapped-types';
import { AddBookDto } from './add-book.dto';

export class EditBookDto extends PartialType(AddBookDto) {}
