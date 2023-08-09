'use client';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import logo from '@/public/logo.jpeg';

import {
  FILE_SIZE_MAX_LIMIT,
  ALLOWED_IMAGE_FILE_EXTENSION,
  ALLOWED_IMAGE_FILE_EXTENSIONS_STRING,
} from '@/constants/signup';

function ImageUpload() {
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Avatar src={previewUploadImage || logo.src} />}
        title="프로필 사진"
        subheader="기본 이미지는 냉면 이미지로 설정됩니다."
      />
      <Box display="flex" justifyContent="flex-end">
        {previewUploadImage && (
          <Button onClick={handleUploadImageRemoval} sx={{color: 'grey'}}>
            제거
          </Button>
        )}
        <label htmlFor="file-upload-button">
          <input
            type="file"
            id="file-upload-button"
            accept={ALLOWED_IMAGE_FILE_EXTENSION}
            onChange={handleUploadFile}
            hidden
            ref={fileInputRef}
          />
          <Button component="span">업로드</Button>
        </label>
      </Box>
    </Card>
  );
}

export default ImageUpload;
