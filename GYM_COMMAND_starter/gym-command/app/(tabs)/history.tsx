import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel, Label } from '../../src/components/UI';
import { getWorkouts, Workout } from '../../src/lib/storage';

export default function History() {
  const [items, setItems] = useState<Workout[]>([]);
  useFocusEffect(useCallback(() => { getWorkouts().then(setItems); }, []));
  return (
    <Screen>
      <Eyebrow>TRAINING RECORDS / 02</Eyebrow>
      <Heading>DZIENNIK</Heading>
      <Text style={{ color: C.muted, marginTop: 5, marginBottom: 20 }}>Historia wykonanych treningów.</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
        {items.length === 0 ? <Panel>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Dziennik jest pusty.</Text>
          <Text style={{ color: C.muted, marginTop: 7, lineHeight: 19 }}>Zapisane sesje będą pojawiać się tutaj chronologicznie.</Text>
        </Panel> : items.map((w) => (
          <Panel key={w.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{w.title}</Text>
              <Label>{new Date(w.date).toLocaleDateString('pl-PL')}</Label>
            </View>
            <Text style={{ color: C.muted, marginTop: 9 }}>{w.exercises.length} ćwiczeń · {w.exercises.reduce((s,e)=>s+e.sets,0)} serii</Text>
            {w.exercises.map((e) => <Text key={e.id} style={{ color: C.steel, marginTop: 7, fontSize: 12 }}>• {e.name}: {e.sets} × {e.reps} · {e.weight} kg</Text>)}
            {w.notes ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 9 }}>Notatka: {w.notes}</Text> : null}
          </Panel>
        ))}
      </ScrollView>
    </Screen>
  );
}
