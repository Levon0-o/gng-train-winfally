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
        </Panel> : items.map((workout) => {
          const totalSets = workout.exercises.reduce((sum, exercise) => sum + (exercise.setDetails?.length ?? exercise.sets), 0);
          return (
            <Panel key={workout.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{workout.title}</Text>
                <Label>{new Date(workout.date).toLocaleDateString('pl-PL')}</Label>
              </View>
              <Text style={{ color: C.muted, marginTop: 9 }}>{workout.exercises.length} ćwiczeń · {totalSets} serii</Text>
              {workout.exercises.map((exercise) => (
                <View key={exercise.id} style={{ marginTop: 11 }}>
                  <Text style={{ color: C.steel, fontWeight: '800', fontSize: 12 }}>{exercise.name}</Text>
                  {exercise.setDetails?.map((set, index) => (
                    <Text key={set.id} style={{ color: C.muted, marginTop: 4, fontSize: 12 }}>Seria {index + 1} — {set.reps} powt. · {set.weight} kg</Text>
                  )) ?? <Text style={{ color: C.muted, marginTop: 4, fontSize: 12 }}>{exercise.sets} × {exercise.reps} · {exercise.weight} kg</Text>}
                </View>
              ))}
              {workout.notes ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 12 }}>Notatka: {workout.notes}</Text> : null}
            </Panel>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
