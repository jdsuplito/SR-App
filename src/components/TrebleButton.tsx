import Button from "@mui/material/Button";
import { useRef } from "react";
import { Beam, Formatter, Voice } from "vexflow/core";
import { useGenRandomStaveNote } from "../hooks/useGenRandomStaveNote";
import { useVexFlow } from "../hooks/useVexFlow";

const TrebleButton: React.FC = () => {
  const { vexContext, topStave2, tickables, setBeams, setTickables, clearStaveNotes } = useVexFlow();
  const trebleRef = useRef<HTMLButtonElement | null>(null);
  const { generateRandomStaveNotesFor44 } = useGenRandomStaveNote();

  const drawStaveNotes = () => {
    if (vexContext && topStave2) {
      const notes = generateRandomStaveNotesFor44("treble");

      const beams = Beam.generateBeams(notes);
      const voice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables(notes);
      new Formatter().joinVoices([voice]).format([voice], topStave2.getWidth());

      voice.draw(vexContext, topStave2);
      beams.forEach((beam) => {
        beam.setContext(vexContext).draw();
      });

      setTickables(notes);
      setBeams(beams);
    }
  };

  return (
    <Button 
      sx={{ flexGrow: 1 }} 
      ref={trebleRef} 
      onClick={tickables.length > 0 ? clearStaveNotes : drawStaveNotes} 
      variant="contained"
      color={tickables.length > 0 ? "error" : "primary"}
    >{tickables.length > 0 ? "Clear" : "Treble"}</Button>
  );
};

export default TrebleButton;
