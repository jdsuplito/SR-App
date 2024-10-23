import Grid from '@mui/material/Grid2';
import { useVexFlow } from '../hooks/useVexFlow';
import Box from '@mui/material/Box';
import { useBluetooth } from '../hooks/useBluetooth';
import { useEffect, useRef, useState } from 'react';
import MainPage from './MainPage';
import { Beam, Formatter, Voice } from 'vexflow/core';
import { useGenRandomStaveNote } from '../hooks/useGenRandomStaveNote';

const MainComp: React.FC = () => {
  // hooks
  const { btCharacteristic, pressedKey, connectToBluetoothDevice } = useBluetooth();
  const { vexOutputDivRef, vexContext, topStave2, tickables, setTickables } = useVexFlow();
  const { generateRandomStaveNotesFor44, enharmonicEquivalentsWithOctaveShift } = useGenRandomStaveNote();

  // State
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);

  // refs
  const trebleRef = useRef<HTMLButtonElement | null>(null);

  // constants
  const currentNote = tickables[currentNoteIndex];
  

  // functions
  const drawStaveNotes = (clef: string) => {
    if (vexContext && topStave2) {
      const generatedNotes = generateRandomStaveNotesFor44(clef);
      const beams = Beam.generateBeams(generatedNotes);
      const voice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables(generatedNotes);
      new Formatter().joinVoices([voice]).format([voice], topStave2.getWidth());

      voice.draw(vexContext, topStave2);
      beams.forEach((beam) => {
        beam.setContext(vexContext).draw();
      });

      //
      generatedNotes.forEach((note) => {
        console.log(note.keys);//
      })
      //

      setTickables(generatedNotes);
    }
  };

  const clearStaveNotes = () => {
    tickables.forEach((tickable) => {
      tickable.getBeam()?.getSVGElement()?.remove();
      tickable.stem?.getSVGElement()?.remove();
      tickable.getSVGElement()?.remove();
    });

    setTickables([]);
  };

  const changeNoteColor = (color: string) => {
    const currentNoteKey = currentNote.keys[0];
    currentNote.hasBeam() && ((currentNote.getBeam() as Beam).notes).forEach((note) => {
      if (note.keys[0] === currentNoteKey) {
        const beam = note.getBeam();
        Object.assign((note.stem?.getSVGElement() as SVGElement).style, 
        { fill: color, stroke: color }
        );
        ((beam as Beam).getSVGElement() as SVGElement).querySelectorAll('*').forEach((childNode) => {
          Object.assign(
            (childNode as HTMLElement).style,
            { fill: color, stroke: color }
          );
        })
      }
    });

    (currentNote.getSVGElement() as SVGElement)
    .querySelectorAll('*')
    .forEach((childNode) => {
      Object.assign(
        (childNode as HTMLElement).style,
        { fill: color, stroke: color }
      );
    });
  };

  const compareNotes = () => {
    if (!pressedKey || !currentNote) return;
    const vexFlowNoteKey = currentNote.keys[0];
    const [vexFlowNoteName, vexFlowOctave] = vexFlowNoteKey.split('/');

    // Extract and format pressed note keys
    const [combinedNoteName, pressedOctave] = pressedKey.noteName.split('/');
    const pressedNoteKeys = combinedNoteName.split('-').map((noteName) => `${noteName}/${pressedOctave}`);

     // Check for enharmonic equivalents with octave adjustments
    const equivalentNote = enharmonicEquivalentsWithOctaveShift[vexFlowNoteName];
    let expectedNoteName = vexFlowNoteName;
    let expectedOctave = parseInt(vexFlowOctave, 10);

    // If there's an enharmonic equivalent, adjust the note and octave accordingly
    if (equivalentNote) {
      expectedNoteName = equivalentNote.note;
      expectedOctave += equivalentNote.octaveShift;
    }

    const expectedNoteKey = equivalentNote ? `${expectedNoteName}/${expectedOctave}` : vexFlowNoteKey;

    // Find the pressed note that matches the VexFlow note or its enharmonic equivalent
    const pressedNoteMatch = pressedNoteKeys.find((noteKey) => {
      const [noteName, noteOctave] = noteKey.split('/');
      const isNoteNameMatch = expectedNoteName === noteName;

      // Ensure both note name and octave match
      return isNoteNameMatch && expectedOctave === parseInt(noteOctave, 10);
    });

    console.log('pressedNoteMatch', pressedNoteMatch);//
    console.log('pressedNoteKeys', pressedNoteKeys);//
    console.log('expectedNoteKey', expectedNoteKey);//
    console.log('vexFlowNoteKey', vexFlowNoteKey);//
    console.log('enharmonicEquivalents', equivalentNote);//

    // Check if the matching pressed note is the same as the current VexFlow note (including octave)
    const isCorrectMatch = pressedNoteMatch === expectedNoteKey;
    return isCorrectMatch;
  };

  const removeClassList = () => {
    if (!tickables) return;
    tickables.forEach((tickable) => {
      tickable.getSVGElement()?.classList.remove('pump-animation');
      tickable.stem?.getSVGElement()?.classList.remove('pump-animation');
      tickable.getBeam()?.getSVGElement()?.classList.remove('pump-animation');
    })
  }

  const addClassList = () => {
    if (!currentNote) return;
    if (currentNote.hasBeam()) {
      (currentNote.getBeam() as Beam).notes.forEach((note) => {
        const currentNoteKey = currentNote.keys[0];
        const noteKey = note.keys[0];
        if (noteKey === currentNoteKey) {
          const beam = note.getBeam();
          note.getSVGElement()?.classList.add('pump-animation');
          note.stem?.getSVGElement()?.classList.add('pump-animation');
          beam?.getSVGElement()?.classList.add('pump-animation');
        }
      })
    } else {
      currentNote?.getSVGElement()?.classList.add('pump-animation');
    }
  }

  const handleTrebleBtn = () => {
    drawStaveNotes("treble");
  }

  // useEffects
  useEffect(() => {
    if (tickables.length === 0 || currentNote === null) return;
    removeClassList();
    addClassList();
  }, [tickables.length, currentNoteIndex])

  useEffect(() => {
    // Check if there are notes in tickables and pressedKeys is not empty
    if (tickables.length === 0 || pressedKey === null) return;

    const isCorrectMatch = compareNotes();

    // Compare the pressed key with the current note
    if (isCorrectMatch) {
      changeNoteColor("#489d48");
      setCurrentNoteIndex((prevIndex) => prevIndex + 1); // Move to the next note

      if (currentNoteIndex + 1 >= tickables.length) {
        // If all notes have been checked, clear the stave and reset everything
        clearStaveNotes();
        setCurrentNoteIndex(0);
      }
    } else {
      changeNoteColor("#ff4a4a");
    }
  }, [pressedKey]);

  // Props
  const mainPageProps = {
    btCharacteristic,
    vexOutputDivRef,
    trebleRef,
    tickables,
    connectToBluetoothDevice,
    clearStaveNotes,
    handleTrebleBtn
  };


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
        <MainPage { ...mainPageProps }/>
      </Grid>
    </Box>
  );
};

export default MainComp;
