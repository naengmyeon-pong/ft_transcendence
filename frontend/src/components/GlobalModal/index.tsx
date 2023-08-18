import {useGlobalModal} from '@/hooks/useGlobalModal';
import {Box, Modal, Typography} from '@mui/material';
import {modalStyle} from '../styled/modalStyle';

export default function CustomModal() {
  const {
    global_modal_data: {isOpen, title, content, action},
    closeGlobalModal,
  } = useGlobalModal();

  return (
    <>
      <Modal open={isOpen} onClose={closeGlobalModal}>
        <Box sx={modalStyle}>
          <Typography variant="h4">{title}</Typography>
          <Box>{content}</Box>
          <Box>{action}</Box>
        </Box>
      </Modal>
    </>
  );
}
