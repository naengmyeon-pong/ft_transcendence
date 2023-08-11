import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';

function AlertSnackbar() {
  const {alertSnackbarDataState, closeAlertSnackbar} = useAlertSnackbar();

  return (
    <>
      <Snackbar
        open={alertSnackbarDataState.isOpen}
        autoHideDuration={6000}
        onClose={closeAlertSnackbar}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert
          onClose={closeAlertSnackbar}
          severity={alertSnackbarDataState.severity}
          sx={{width: '100%'}}
        >
          {alertSnackbarDataState.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AlertSnackbar;
