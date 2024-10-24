import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { StaveNote } from "vexflow/core";

interface MainPageProps {
  btCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  vexOutputDivRef: React.RefObject<HTMLDivElement> | null;
  trebleRef: React.RefObject<HTMLButtonElement> | null;
  bothRef: React.RefObject<HTMLButtonElement> | null;
  bassRef: React.RefObject<HTMLButtonElement> | null;
  tickables: StaveNote[];
  connectToBluetoothDevice: () => void;
  handleTrebleBtn: () => void;
  handleBothBtn: () => void;
  handleBassBtn: () => void;
  clearStaveNotes: () => void;
}

const MainPage: React.FC<MainPageProps> = (props) => {
  const {
    btCharacteristic,
    vexOutputDivRef,
    trebleRef,
    bothRef,
    bassRef,
    connectToBluetoothDevice,
    handleTrebleBtn,
    handleBothBtn,
    handleBassBtn,
  } = props;

  return (
    <>
      <Button 
          disabled={!!btCharacteristic} 
          onClick={connectToBluetoothDevice}
          variant="contained" 
        >
          {btCharacteristic ? "Bluetooth Connected" : "Connect to Bluetooth"}
      </Button>
      <Grid 
        container
        ref={vexOutputDivRef}
        width={"100%"}
        display={"flex"}
        justifyContent={"center"}
      >
      </Grid>
      <Grid
        container
        spacing={1}
        width={"100%"}
        display={"flex"}
        justifyContent={"space-evenly"}
      >
        <Button
          disabled={!btCharacteristic}
          sx={{ flexGrow: 1 }} 
          ref={trebleRef} 
          onClick={handleTrebleBtn} 
          variant="contained"
        >
          Treble
        </Button>

        <Button
          disabled={!btCharacteristic}
          sx={{ flexGrow: 1 }} 
          variant="contained"
          ref={bothRef}
          onClick={handleBothBtn} 
        >
          Both
        </Button>

        <Button
          disabled={!btCharacteristic}
          sx={{ flexGrow: 1 }} 
          variant="contained"
          ref={bassRef}
          onClick={handleBassBtn} 
        >
          Bass
        </Button>
      </Grid>
    </>
  )
}

export default MainPage;