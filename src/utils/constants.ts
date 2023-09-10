export const jwtSecret = process.env.JWT_SECRET;

export const IMAGE_URL = process.env.IMG_URL;

export const MAX_FILE_SIZE = 1 * 1024 * 1024;

export const MAX_TOTAL_SIZE = 5 * 1024 * 1024;

export enum SortOrder {
  DESC = 'desc',
  ASC = 'asc',
}
