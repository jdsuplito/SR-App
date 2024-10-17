import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Barline, Beam, RenderContext, Renderer, Stave, StaveConnector, StaveNote } from 'vexflow/core';
import 'vexflow/bravura';

interface VexFlowContextType {
  vexContext: RenderContext | null;
  topStave2: Stave | null;
  botStave2: Stave | null;
  tickables: StaveNote[];
  beams: Beam[];
  vexOutputDivRef: React.RefObject<HTMLDivElement>;
  setVexContext: React.Dispatch<React.SetStateAction<RenderContext | null>>;
  setTopStave2: React.Dispatch<React.SetStateAction<Stave | null>>;
  setBotStave2: React.Dispatch<React.SetStateAction<Stave | null>>;
  setTickables: React.Dispatch<React.SetStateAction<StaveNote[]>>;
  setBeams: React.Dispatch<React.SetStateAction<Beam[]>>;
  clearStaveNotes: () => void;
}

const VexFlowContext = createContext<VexFlowContextType | undefined>(undefined);

export const useVexFlow = () => {
  const context = useContext(VexFlowContext);
  if (!context) {
    throw new Error('useVexFlow must be used within a VexFlowProvider');
  }
  return context;
};

export const VexFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vexContext, setVexContext] = useState<RenderContext | null>(null);
  const [topStave2, setTopStave2] = useState<Stave | null>(null);
  const [botStave2, setBotStave2] = useState<Stave | null>(null);
  const [tickables, setTickables] = useState<StaveNote[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const vexOutputDivRef = useRef<HTMLDivElement | null>(null);

  const baseCanvas = () => {
    if (!vexOutputDivRef.current) return;

    const vexRenderer = new Renderer(vexOutputDivRef.current, Renderer.Backends.SVG);
    vexRenderer.resize(1000, 300);

    const vexContext = vexRenderer.getContext();

    const topStave1 = new Stave(20, 35, 80)
      .setBegBarType(Barline.type.NONE)
      .setEndBarType(Barline.type.NONE)
      .addClef("treble")
      .addTimeSignature("4/4")
      .setContext(vexContext)
      .draw();

    const botStave1 = new Stave(20, 135, 80)
      .setBegBarType(Barline.type.NONE)
      .setEndBarType(Barline.type.NONE)
      .addClef("bass")
      .setContext(vexContext)
      .draw();

    const topStave2 = new Stave(topStave1.getWidth() + topStave1.getX(), 35, 900)
      .setBegBarType(Barline.type.NONE)
      .setEndBarType(Barline.type.NONE)
      .setContext(vexContext)
      .draw();

    const botStave2 = new Stave(botStave1.getWidth() + botStave1.getX(), 135, 900)
      .setBegBarType(Barline.type.NONE)
      .setEndBarType(Barline.type.NONE)
      .setContext(vexContext)
      .draw();

    const brace = new StaveConnector(topStave1, botStave1).setType(3);
    const begbarLine1 = new StaveConnector(topStave1, botStave1).setType(1);

    brace.setContext(vexContext).draw();
    begbarLine1.setContext(vexContext).draw();

    vexContext.setFillStyle("red");
    const begBarline2 = new StaveConnector(topStave2, botStave2).setType(1);
    begBarline2.setContext(vexContext).draw();

    vexContext.setFillStyle("black");

    setVexContext(vexContext);
    setTopStave2(topStave2);
    setBotStave2(botStave2);
  };

  useEffect(() => {
    baseCanvas();
  }, [vexOutputDivRef]);

  const clearStaveNotes = () => {
    tickables.forEach((tickable) => {
      tickable.stem?.getSVGElement()?.remove();
      tickable.getSVGElement()?.remove();
    });
    beams.forEach((beam) => {
      beam.getSVGElement()?.remove();
    });

    setTickables([]);
    setBeams([]);
  };

  const value = {
    vexContext,
    topStave2,
    botStave2,
    tickables,
    beams,
    vexOutputDivRef,
    setVexContext,
    setTopStave2,
    setBotStave2,
    setTickables,
    setBeams,
    clearStaveNotes,
  };

  return <VexFlowContext.Provider value={value}>{children}</VexFlowContext.Provider>;
};
