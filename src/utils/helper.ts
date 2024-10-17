import { Beam, StaveNote } from "vexflow/core";

// Constants for the Bluetooth MIDI service and characteristics
export const BT_MIDI_SERVICE_UID =
  "03B80E5A-EDE8-4B33-A751-6CE34EC4C700".toLowerCase();
export const MIDI_CHARACTERISTIC_UID =
  "7772E5DB-3868-4112-A1A9-F2669D106BF3".toLowerCase();

export const changeColor = (tickables: StaveNote[], currentIndex: number, color: string) => {
  const tickableKey = tickables[currentIndex].keys[0];

  tickables[currentIndex].hasBeam() && ((tickables[currentIndex].getBeam() as Beam).notes).forEach((note) => {
    if (note.keys[0] === tickableKey) {
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

  (tickables[currentIndex].getSVGElement() as SVGElement)
  .querySelectorAll('*')
  .forEach((childNode) => {
    Object.assign(
      (childNode as HTMLElement).style,
      { fill: color, stroke: color }
    );
  });
};