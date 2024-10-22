import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { StaveNote } from "vexflow/core";

interface MainPageProps {
  btCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  vexOutputDivRef: React.RefObject<HTMLDivElement> | null;
  trebleRef: React.RefObject<HTMLButtonElement> | null;
  tickables: StaveNote[];
  connectToBluetoothDevice: () => void;
  handleTrebleBtn: () => void;
  clearStaveNotes: () => void;
}

const MainPage: React.FC<MainPageProps> = (props) => {
  const {
    btCharacteristic,
    vexOutputDivRef,
    trebleRef,
    tickables,
    connectToBluetoothDevice,
    handleTrebleBtn,
    clearStaveNotes
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
          onClick={tickables.length > 0 ? clearStaveNotes : handleTrebleBtn} 
          variant="contained"
          color={tickables.length > 0 ? "error" : "primary"}
        >
          {tickables.length > 0 ? "Clear" : "Treble"}
        </Button>

        <Button
          disabled={!btCharacteristic}
          sx={{ flexGrow: 1 }} variant="contained"
        >
          Both
        </Button>

        <Button
          disabled={!btCharacteristic}
          sx={{ flexGrow: 1 }} variant="contained"
        >
          Bass
        </Button>
      </Grid>
    </>
  )
}

export default MainPage;