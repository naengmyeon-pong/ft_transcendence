import {AlertColor} from '@mui/material/Alert';

export type AlertSnackbarType = {
  isOpen?: boolean;
  message: JSX.Element | string;
  severity?: AlertColor;
  callBack?: () => any;
};

export type OpenSnackbarType = {
  message: JSX.Element | string;
  severity?: AlertColor;
  callback?: () => any;
};
