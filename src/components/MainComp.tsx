import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TrebleButton from './TrebleButton';
import { useVexFlow } from '../hooks/useVexFlow';
import Box from '@mui/material/Box';
import { useBluetooth } from '../hooks/useBluetooth';
import { useEffect, useState } from 'react';

const MainComp: React.FC = () => {
  const { btCharacteristic, pressedKey, connectToBluetoothDevice } = useBluetooth();
  const { vexOutputDivRef, tickables, clearStaveNotes } = useVexFlow();
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current note index

  //todo: change the color of the beams

  useEffect(() => {
    // Check if there are notes in tickables and pressedKeys is not empty
    if (tickables.length === 0 || pressedKey === null) return;
    const expectedNoteName = tickables[currentIndex].keys[0];

    const [combinedNoteName, octaveNo] = pressedKey.noteName.split('/');
    const pressedNoteNames = combinedNoteName
      .split('-')
      .map((noteName) => `${noteName}/${octaveNo}`);

    console.log('pressedNoteNames', pressedNoteNames);
    console.log('expectedNoteName', expectedNoteName);

    const isCorrectMatch = pressedNoteNames.includes(expectedNoteName);

    const changeToGreen = () => {
      (tickables[currentIndex].getSVGElement() as SVGElement)
        .querySelectorAll('*')
        .forEach((childNode) => {
          Object.assign(
            (childNode as HTMLElement).style,
            { fill: 'green', stroke: 'green' }
          );
        });
    };

    const changeToRed = () => {
      (tickables[currentIndex].getSVGElement() as SVGElement)
        .querySelectorAll('*')
        .forEach((childNode) => {
          Object.assign(
            (childNode as HTMLElement).style,
            { fill: 'red', stroke: 'red' }
          );
        });
    };

    // Compare the pressed key with the current note
    if (isCorrectMatch) {
      changeToGreen();
      setCurrentIndex((prevIndex) => prevIndex + 1); // Move to the next note

      if (currentIndex + 1 >= tickables.length) {
        // If all notes have been checked, clear the stave and reset everything
        clearStaveNotes();
        setCurrentIndex(0);
      }
    } else {
      changeToRed();
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
          <TrebleButton />
          <Button sx={{ flexGrow: 1 }} variant="contained">Both</Button>
          <Button sx={{ flexGrow: 1 }} variant="contained">Bass</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainComp;
