'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import {useGlobalDialog} from '@/hooks/useGlobalDialog';

function GlobalDialog() {
  const {
    globalDialogDataState: {isOpen, title, content, actions},
    closeGlobalDialog,
  } = useGlobalDialog();

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={closeGlobalDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Dialog>
    </>
  );
}

export default GlobalDialog;
