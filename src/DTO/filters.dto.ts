import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'src/utils/constants';

export class FiltersDto {
  @IsNotEmpty()
  @IsString()
  page: string;

  @IsNotEmpty()
  @IsString()
  pageSize: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  sortOrder: SortOrder;

  @IsOptional()
  @IsString()
  priceFrom: string;

  @IsOptional()
  @IsString()
  priceTo: string;
}
