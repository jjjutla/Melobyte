import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

const TransactionDialog = (props: any) => {
  const {
    isTxDialogOpen,
    activeTxStep,
    onTxDialogClose,
    fullTrackHash,
    stemsHash,
    sectionsHash,
    isEncryptFiles,
  } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog fullWidth open={isTxDialogOpen} fullScreen={fullScreen}>
      <DialogContent style={{ backgroundImage: 'linear-gradient(to right, #06DBAC, #BD00FF)' }}>
        <DialogTitle fontWeight="bold" color="Black">Music Metadata Creation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeTxStep} orientation="vertical">
            <Step>

              <Typography fontWeight="bold" color="Black">Music Assets Storage</Typography>

              <StepContent>
                <Typography variant="caption" fontWeight="bold" color="Black">
                  {isEncryptFiles
                    ? "Encrypting and Storing on Web3 Storage"
                    : "Storing on Web3 Storage"}
                </Typography>
                <LinearProgress color="secondary" />
              </StepContent>
            </Step>
            <Step>
              <Typography fontWeight="bold" color="Black">Submitting Fulltrack</Typography>
              {fullTrackHash === "error" ? (
                <Typography variant="caption" color="error">
                  Error
                </Typography>
              ) : (
                <Typography color="black" variant="caption">{fullTrackHash}</Typography>
              )}

              <StepContent>
                <Typography variant="caption" fontWeight="bold" color="Black">
                  Transaction in progress...
                </Typography>
                <LinearProgress color="secondary" />
              </StepContent>
            </Step>
            <Step>
              <Typography fontWeight="bold" color="Black">Submitting Proof of Creation (stems)</Typography>
              {fullTrackHash === "error" ? (
                <Typography variant="caption" color="error" >
                  Error
                </Typography>
              ) : (
                stemsHash.map((stemHash: string) => (
                  <Typography color="black" variant="caption">{stemHash}</Typography>
                ))
              )}
              <StepContent>
                <Typography variant="caption" fontWeight="bold" color="Black">
                  Transaction in progress...
                </Typography>
                <LinearProgress color="secondary" />
              </StepContent>
            </Step>
            <Step>
              <Typography fontWeight="bold" color="Black">Submitting Sections</Typography>
              {fullTrackHash === "error" ? (
                <Typography variant="caption" color="error">
                  Error
                </Typography>
              ) : (
                sectionsHash.map((sectionHash: string) => (
                  <Typography color="black" variant="caption">{sectionHash}</Typography>
                ))
              )}
              <StepContent>
                <Typography variant="caption" fontWeight="bold" color="Black">
                  Transaction in progress...
                </Typography>
                <LinearProgress color="secondary" />
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          {activeTxStep > 3 && (
            <Button variant="contained" onClick={onTxDialogClose}>
              Exit
            </Button>
          )}
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
