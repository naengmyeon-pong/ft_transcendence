import {NOT_FOUND} from '@/constants';
import {
  FILE_SIZE_MAX_LIMIT,
  ALLOWED_IMAGE_FILE_EXTENSION,
} from '@/constants/signup';

export const extractFileExtension = (name: string): string => {
  const lastCommaIndex = name.lastIndexOf('.');
  if (lastCommaIndex === NOT_FOUND) {
    return '';
  }
  return name.substring(lastCommaIndex + 1).toLowerCase();
};

export const isAllowedImageExtension = (extension: string): boolean => {
  if (
    ALLOWED_IMAGE_FILE_EXTENSION.indexOf(extension) === NOT_FOUND ||
    extension === ''
  ) {
    return false;
  }
  return true;
};

export const isFileSizeExceeded = (size: number): boolean => {
  if (size > FILE_SIZE_MAX_LIMIT) {
    return true;
  }
  return false;
};
