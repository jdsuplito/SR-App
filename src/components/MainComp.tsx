import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TrebleButton from './TrebleButton';
import { useVexFlow } from '../hooks/useVexFlow';
import Box from '@mui/material/Box';
import { useBluetooth } from '../hooks/useBluetooth';
import { useEffect, useState } from 'react';
import { changeColor } from '../utils/helper';
import { StaveNote } from 'vexflow/core';

const MainComp: React.FC = () => {
  const { btCharacteristic, pressedKey, connectToBluetoothDevice } = useBluetooth();
  const { vexOutputDivRef, tickables, clearStaveNotes } = useVexFlow();
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current note index

  //todo: make the animation focus on the current note
  //todo: make the buttons disabled when bluetooth is not connected
  //todo: create usecontext for bluetooth

  useEffect(() => {
    const currentNote = tickables[currentIndex];
    tickables.forEach((tickable) => {
      tickable.getSVGElement()?.classList.remove('pump-animation');
    })
    currentNote?.getSVGElement()?.classList.add('pump-animation');
  }, [tickables.length, currentIndex])

  useEffect(() => {
    // Check if there are notes in tickables and pressedKeys is not empty
    if (tickables.length === 0 || pressedKey === null) return;

    const expectedNoteName = tickables[currentIndex].keys[0];
    const [combinedNoteName, octaveNo] = pressedKey.noteName.split('/');
    const pressedNoteNames = combinedNoteName
      .split('-')
      .map((noteName) => `${noteName}/${octaveNo}`);

    console.log('pressedNoteNames', pressedNoteNames);//
    console.log('expectedNoteName', expectedNoteName);//

    const isCorrectMatch = pressedNoteNames.includes(expectedNoteName);

    // Compare the pressed key with the current note
    if (isCorrectMatch) {
      changeColor(tickables, currentIndex, "#489d48");
      setCurrentIndex((prevIndex) => prevIndex + 1); // Move to the next note

      if (currentIndex + 1 >= tickables.length) {
        // If all notes have been checked, clear the stave and reset everything
        clearStaveNotes();
        setCurrentIndex(0);
      }
    } else {
      changeColor(tickables, currentIndex, "#ff4a4a");
    }
  }, [pressedKey]);


  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        spacing={2}
        width={"100%"}
        display={"flex"}
        justifyContent={"space-evenly"}
        flexDirection={"column"}
        padding={1}
      >
        <Button disabled={!!btCharacteristic} variant="contained" onClick={connectToBluetoothDevice}>
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
          <TrebleButton disabled={!btCharacteristic} />

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
      </Grid>
    </Box>
  );
};

export default MainComp;
