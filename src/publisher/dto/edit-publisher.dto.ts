import { PartialType } from '@nestjs/mapped-types';
import { AddPublisherDto } from './add-publisher.dto';

export class EditPublisherDto extends PartialType(AddPublisherDto) {}
