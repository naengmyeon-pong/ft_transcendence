import {useState, useRef} from 'react';

import {useRecoilState} from 'recoil';

import {profileImageState} from '@/states/profileImage';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {
  extractFileExtension,
  isAllowedImageExtension,
  isFileSizeExceeded,
} from '@/utils/ProfileImage';
import {
  FILE_SIZE_MAX_LIMIT,
  ALLOWED_IMAGE_FILE_EXTENSIONS_STRING,
} from '@/constants/signup';

export const useProfileImage = () => {
  const {openAlertSnackbar} = useAlertSnackbar();
  const [profileImageDataState, setProfileImageDataState] =
    useRecoilState(profileImageState);
  const {userId} = profileImageDataState;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState('');

  const setUserId = (userId: string) => {
    setProfileImageDataState({...profileImageDataState, userId});
  };

  const handleImageRemoval = () => {
    if (previewImage === '') {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input value
    }
    setPreviewImage('');
  };

  const createImageFile = (file: File, filename: string): File => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64data = reader.result;
        setPreviewImage(base64data);
      }
    };
    const imageFile = new File([file], filename, {
      type: file.type,
    });
    return imageFile;
  };

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event;
    const {files} = target;
    if (files === undefined) {
      return;
    }

    const file = files?.[0];
    if (file === undefined || file === null) {
      return;
    }

    const extension = extractFileExtension(file.name);
    if (isAllowedImageExtension(extension) === false) {
      target.value = '';
      openAlertSnackbar({
        message: `확장자는 ${ALLOWED_IMAGE_FILE_EXTENSIONS_STRING} 만 가능합니다.`,
      });
      return;
    }

    if (isFileSizeExceeded(file.size) === true) {
      target.value = '';
      openAlertSnackbar({
        message: `파일 크기는 ${
          FILE_SIZE_MAX_LIMIT / 1024 / 1024
        }MB 이하로 제한됩니다.`,
      });
      return;
    }

    const filename = `${userId}.${extension}`;
    const modifiedFileNameByUserId: File = createImageFile(file, filename);
    setProfileImageDataState({
      ...profileImageDataState,
      uploadFile: modifiedFileNameByUserId,
    });
  };

  return {
    profileImageDataState,
    previewImage,
    fileInputRef,
    setUserId,
    handleUploadFile,
    handleImageRemoval,
  };
};
