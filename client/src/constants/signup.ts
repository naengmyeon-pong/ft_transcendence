export const ALLOWED_IMAGE_FILE_EXTENSION = 'image/jpg, image/jpeg, image/png';
export const ALLOWED_IMAGE_FILE_EXTENSIONS_STRING =
  ALLOWED_IMAGE_FILE_EXTENSION.split(',')
    .map(extension => {
      return extension.split('/')[1];
    })
    .join(' ');
export const FILE_SIZE_MAX_LIMIT = 1 * 1024 * 1024; // 1MB
