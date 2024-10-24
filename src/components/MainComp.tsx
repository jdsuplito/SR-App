import Grid from '@mui/material/Grid2';
import { useVexFlow } from '../hooks/useVexFlow';
import Box from '@mui/material/Box';
import { useBluetooth } from '../hooks/useBluetooth';
import { useEffect, useRef, useState } from 'react';
import MainPage from '../pages/MainPage';
import { Beam, Formatter, Stave, Voice } from 'vexflow/core';
import { useGenRandomStaveNote } from '../hooks/useGenRandomStaveNote';
import CompletionModal from './modals/CompletionModal';

const MainComp: React.FC = () => {
  // hooks
  const { btCharacteristic, pressedKey, connectToBluetoothDevice } = useBluetooth();
  const { vexOutputDivRef, vexContext, topStave2, botStave2, tickables, setTickables } = useVexFlow();
  const { generateRandomStaveNotesFor44, enharmonicEquivalentsWithOctaveShift } = useGenRandomStaveNote();

  // State
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [openCompletionModal, setOpenCompletionModal] = useState(false);

  // refs
  const trebleRef = useRef<HTMLButtonElement | null>(null);
  const bothRef = useRef<HTMLButtonElement | null>(null);
  const bassRef = useRef<HTMLButtonElement | null>(null);

  // constants
  const currentNote = tickables[currentNoteIndex];
  

  // functions
  const drawStaveNotes = (clef: string, stave: Stave) => {
    if (vexContext && stave) {
      const generatedNotes = generateRandomStaveNotesFor44(clef);
      const beams = Beam.generateBeams(generatedNotes);
      const voice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables(generatedNotes);
      new Formatter().joinVoices([voice]).format([voice], stave.getWidth());

      voice.draw(vexContext, stave);
      beams.forEach((beam) => {
        beam.setContext(vexContext).draw();
      });

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

  // handlers
  const handleTrebleBtn = () => {
    if (!topStave2) return;
    if (tickables.length > 0) clearStaveNotes();
    drawStaveNotes("treble", topStave2);
  }
  const handleBothBtn = () => {
    if (!topStave2 || !botStave2) return;
    if (tickables.length > 0) { //todo: clearstavenotes on both staves
      clearStaveNotes();
      drawStaveNotes("treble", topStave2);
      drawStaveNotes("bass", botStave2);
    }
  }
  const handleBassBtn = () => {
    if (!topStave2 || !botStave2) return;
    if (tickables.length > 0) clearStaveNotes();
    drawStaveNotes("bass", botStave2);
  }
  const handleCloseCompletionModal = () => setOpenCompletionModal(false);

  // useEffects
  useEffect(() => {
    if (tickables.length === 0 || currentNote === null) return;
    removeClassList();
    addClassList();
  }, [tickables.length, currentNoteIndex])

  useEffect(() => {
    if (tickables.length === 0 || pressedKey === null) return;

    const isCorrectMatch = compareNotes();

    // Compare the pressed key with the current note
    if (isCorrectMatch) {
      changeNoteColor("#489d48");
      setCurrentNoteIndex((prevIndex) => prevIndex + 1); // Move to the next note

      if (currentNoteIndex + 1 >= tickables.length) {
        // If all notes have been checked, clear the stave and reset everything
        setOpenCompletionModal(true);
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
    bothRef,
    bassRef,
    tickables,
    connectToBluetoothDevice,
    clearStaveNotes,
    handleTrebleBtn,
    handleBothBtn,
    handleBassBtn
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
        <CompletionModal
          openCompletionModal={openCompletionModal}
          handleCloseCompletionModal={handleCloseCompletionModal}
        />
      </Grid>
    </Box>
  );
};

export default MainComp;
