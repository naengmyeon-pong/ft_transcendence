// 2~8자 제한
export const isValidNicknameLength = (nickname: string): boolean => {
  if (2 <= nickname.length && nickname.length <= 8) {
    return true;
  }
  return false;
};

// 8~20자 제한
export const isValidPasswordLength = (password: string): boolean => {
  if (8 <= password.length && password.length <= 20) {
    return true;
  }
  return false;
};

export const isValidPasswordRule = (password: string): boolean => {
  // 대문자, 소문자, 특수문자 각각 하나 이상
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,}$/;
  return regex.test(password);
};
