import { useState, useRef, useEffect } from "react";
import { BT_MIDI_SERVICE_UID, MIDI_CHARACTERISTIC_UID } from "../utils/helper";

// Helper function to map MIDI note numbers to note names and octaves
const getNoteName = (noteId: number) => {
  const noteNames = ["C", "C#-Db", "D", "D#-Eb", "E", "F", "F#-Gb", "G", "G#-Ab", "A", "A#-Bb", "B"];
  const octave = Math.floor(noteId / 12) - 1; // Octave calculation
  const note = noteNames[noteId % 12]; // Note name within an octave
  return `${note}/${octave}`;
};

export const useBluetooth = () => {
  const [btCharacteristic, setBtCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [pressedKey, setPressedKey] = useState<{ noteName: string } | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null); // Reference to characteristic

  useEffect(() => {
    if (btCharacteristic) {
      characteristicRef.current = btCharacteristic;
      // Start listening for MIDI messages
      btCharacteristic.startNotifications().then(() => {
        btCharacteristic.addEventListener("characteristicvaluechanged", handleMIDIEvent);
      });
    }
    return () => {
      // Cleanup the event listener on component unmount or characteristic change
      if (characteristicRef.current) {
        characteristicRef.current.removeEventListener("characteristicvaluechanged", handleMIDIEvent);
      }
    };
  }, [btCharacteristic]);

  const handleMIDIEvent = (event: Event) => {
    const value = (event?.target as BluetoothRemoteGATTCharacteristic).value as DataView;
    const statusByte = value.getUint8(2);
    const noteId = value.getUint8(3);
    const velocity = value.getUint8(4);

    // Only process "Note On" messages with velocity > 0
    if ((statusByte & 0xf0) === 0x90 && velocity > 0) {
      const noteName = getNoteName(noteId);
      setPressedKey({ noteName });
      // console.log(`Key pressed: ${noteName}`);
    }
  };

  const connectToBluetoothDevice = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BT_MIDI_SERVICE_UID] }]
      });
      const gattServer = await device.gatt?.connect();
      const service = await gattServer?.getPrimaryService(BT_MIDI_SERVICE_UID);
      const characteristic = await service?.getCharacteristic(MIDI_CHARACTERISTIC_UID);

      setBtCharacteristic(characteristic as BluetoothRemoteGATTCharacteristic);
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
    }
  };

  return {
    btCharacteristic,
    connectToBluetoothDevice,
    pressedKey
  };
};
