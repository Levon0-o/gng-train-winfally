import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Panel, Label } from '../src/components/UI';

const PRESETS = [60, 90, 120];

function clock(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0');
  const seconds = (value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function RestTimer() {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const timeout = setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timeout);
  }, [running, remaining]);

  const choosePreset = (seconds: number) => {
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 22, paddingTop: 58 }}>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text>
      </Pressable>
      <Eyebrow>RECOVERY INTERVAL / 05</Eyebrow>
      <Heading>TIMER PRZERWY</Heading>
      <Text style={{ color: C.muted, marginTop: 6, lineHeight: 19 }}>Zwykły licznik odpoczynku między seriami. Dostosuj przerwę do samopoczucia — nie skracaj jej na siłę.</Text>

      <Panel style={{ alignItems: 'center', marginTop: 28, paddingVertical: 30 }}>
        <Label>POZOSTAŁY CZAS</Label>
        <Text style={{ color: remaining === 0 ? C.green : C.text, fontSize: 64, fontWeight: '900', letterSpacing: 1, marginTop: 12, fontVariant: ['tabular-nums'] }}>{clock(remaining)}</Text>
        <Text style={{ color: remaining === 0 ? C.green : C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 8 }}>
          {remaining === 0 ? 'PRZERWA ZAKOŃCZONA' : running ? 'ODLICZANIE AKTYWNE' : 'GOTOWY'}
        </Text>
      </Panel>

      <Label style={{ marginTop: 26 }}>WYBIERZ CZAS</Label>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {PRESETS.map((seconds) => {
          const active = duration === seconds;
          return (
            <Pressable key={seconds} onPress={() => choosePreset(seconds)} style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 9, borderWidth: 1, borderColor: active ? C.red : C.line, backgroundColor: active ? '#3A2022' : C.panel }}>
              <Text style={{ color: active ? C.text : C.steel, fontWeight: '900' }}>{seconds / 60}:00</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => remaining === 0 ? reset() : setRunning((value) => !value)} style={{ backgroundColor: C.red, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 22 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>{remaining === 0 ? 'USTAW PONOWNIE' : running ? 'PAUZA' : 'START'}</Text>
      </Pressable>
      <Pressable onPress={reset} style={{ borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 9 }}>
        <Text style={{ color: C.steel, fontWeight: '800' }}>RESET</Text>
      </Pressable>
    </View>
  );
}
