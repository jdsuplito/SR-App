import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";


interface CompletionModalProps {
  openCompletionModal: boolean;
  handleCloseCompletionModal: () => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid gray',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

const CompletionModal: React.FC<CompletionModalProps> = (props) => {
  const { openCompletionModal, handleCloseCompletionModal } = props;

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openCompletionModal}
        onClose={handleCloseCompletionModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openCompletionModal}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Congratulations!
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              You have completed playing the notes. Play again to learn more.
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default CompletionModal;