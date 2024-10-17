import { useCallback } from "react";
import { StaveNote, Accidental } from "vexflow/core";

// Define note durations and their respective beat counts
const durations: { key: string; beats: number }[] = [
  { key: "w", beats: 4 },   // Whole note (4 beats)
  { key: "h", beats: 2 },   // Half note (2 beats)
  { key: "q", beats: 1 },   // Quarter note (1 beat)
  { key: "8", beats: 0.5 }, // Eighth note (0.5 beats)
  { key: "16", beats: 0.25 }// Sixteenth note (0.25 beats)
];

const letters: string[] = ["C", "D", "E", "F", "G", "A", "B"];
const accidentals: string[] = ["", "#", "b"];
const clefOctaves: { [key: string]: string[] } = {
  "treble": ["4", "5"],
  "bass": ["2", "3"]
};

// Utility function to get a random item from an array
const getRandomArrItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const useGenRandomStaveNote = () => {
  const generateRandomStaveNotesFor44 = useCallback((clef: string): StaveNote[] => {
    const result: StaveNote[] = [];
    let remainingBeats = 4;

    while (remainingBeats > 0) {
      // Get valid durations that fit within the remaining beats
      const validDurations = durations.filter(({ beats }) => beats <= remainingBeats);
      
      const { key: durNote, beats: beatCount } = getRandomArrItem(validDurations);
      const letter = getRandomArrItem(letters);
      const accidental = getRandomArrItem(accidentals);
      const octave = getRandomArrItem(clefOctaves[clef]);

      // Create a new StaveNote with the selected values
      const note = new StaveNote({
        clef,
        keys: [`${letter}${accidental}/${octave}`],
        duration: durNote,
      });

      // Add accidental if necessary
      if (accidental) {
        note.addModifier(new Accidental(accidental), 0);
      }

      // Add the note to the result array and reduce remaining beats
      result.push(note);
      remainingBeats -= beatCount;
    }

    return result;
  }, []);

  return {
    generateRandomStaveNotesFor44
  };
};
