import React, { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel } from '../../src/components/UI';
import { getWorkouts, Workout } from '../../src/lib/storage';

export default function Stats() {
  const [items, setItems] = useState<Workout[]>([]);
  useFocusEffect(useCallback(() => { getWorkouts().then(setItems); }, []));
  const exerciseCount = items.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const setCount = items.reduce((sum, workout) => sum + workout.exercises.reduce((count, exercise) => count + (exercise.setDetails?.length ?? exercise.sets), 0), 0);
  const totalReps = items.reduce((sum, workout) => sum + workout.exercises.reduce((count, exercise) => count + (exercise.setDetails?.reduce((s, set) => s + set.reps, 0) ?? exercise.reps * exercise.sets), 0), 0);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Eyebrow>PERFORMANCE DATA / 03</Eyebrow>
        <Heading>STATYSTYKI</Heading>
        <Text style={{ color: C.muted, marginTop: 5, marginBottom: 20 }}>Podsumowanie zapisanej pracy.</Text>
        <Panel style={{ marginBottom: 10 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800' }}>TRENINGI</Text>
          <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 5 }}>{items.length}</Text>
        </Panel>
        <Panel style={{ marginBottom: 10 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800' }}>ĆWICZENIA W SESJACH</Text>
          <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 5 }}>{exerciseCount}</Text>
        </Panel>
        <Panel style={{ marginBottom: 10 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800' }}>ŁĄCZNIE SERII</Text>
          <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 5 }}>{setCount}</Text>
        </Panel>
        <Panel>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800' }}>ŁĄCZNIE POWTÓRZEŃ</Text>
          <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 5 }}>{totalReps}</Text>
        </Panel>
      </ScrollView>
    </Screen>
  );
}
