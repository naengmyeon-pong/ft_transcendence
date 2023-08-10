'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import logo from '@/public/logo.jpeg';
import {useProfileImage} from '@/hooks/useProfileImage';
import {ALLOWED_IMAGE_FILE_EXTENSION} from '@/constants/signup';

function ImageUpload() {
  const {previewImage, fileInputRef, handleUploadFile, handleImageRemoval} =
    useProfileImage();

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Avatar src={previewImage || logo.src} />}
        title="프로필 사진"
        subheader="기본 이미지는 냉면 이미지로 설정됩니다."
      />
      <Box display="flex" justifyContent="flex-end">
        {previewImage && (
          <Button onClick={handleImageRemoval} sx={{color: 'grey'}}>
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
