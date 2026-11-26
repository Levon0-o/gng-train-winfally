import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel, Label } from '../../src/components/UI';
import { getWorkouts, Workout } from '../../src/lib/storage';

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

function toCsv(items: Workout[]) {
  const rows = [['Data', 'Trening', 'Notatki', 'Ćwiczenie', 'Seria', 'Powtórzenia', 'Ciężar (kg)']];
  items.forEach((workout) => workout.exercises.forEach((exercise) => {
    const sets = exercise.setDetails?.length ? exercise.setDetails : [{ reps: exercise.reps, weight: exercise.weight }];
    sets.forEach((set, index) => rows.push([
      new Date(workout.date).toLocaleString('pl-PL'),
      workout.title,
      workout.notes,
      exercise.name,
      String(index + 1),
      String(set.reps),
      String(set.weight),
    ]));
  }));
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\n');
}

export default function History() {
  const [items, setItems] = useState<Workout[]>([]);
  useFocusEffect(useCallback(() => { getWorkouts().then(setItems); }, []));

  const exportHistory = async () => {
    if (!items.length) {
      Alert.alert('Brak danych', 'Zapisz trening, aby móc wyeksportować historię.');
      return;
    }
    try {
      await Share.share({ title: 'GYM COMMAND — historia treningów.csv', message: toCsv(items) });
    } catch {
      Alert.alert('Eksport niedostępny', 'Nie udało się otworzyć udostępniania.');
    }
  };

  return (
    <Screen>
      <Eyebrow>TRAINING RECORDS / 02</Eyebrow>
      <Heading>DZIENNIK</Heading>
      <Text style={{ color: C.muted, marginTop: 5 }}>Historia zapisanych sesji.</Text>
      <Pressable onPress={exportHistory} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.red, borderRadius: 9, padding: 13, marginTop: 15, marginBottom: 15, alignItems: 'center' }}>
        <Text style={{ color: C.text, fontWeight: '900', letterSpacing: 1 }}>⇩ EKSPORTUJ HISTORIĘ CSV</Text>
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
        {items.length === 0 ? <Panel>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Dziennik jest pusty.</Text>
          <Text style={{ color: C.muted, marginTop: 7, lineHeight: 19 }}>Zapisane sesje będą pojawiać się tutaj chronologicznie.</Text>
        </Panel> : items.map((workout) => {
          const totalSets = workout.exercises.reduce((sum, exercise) => sum + (exercise.setDetails?.length ?? exercise.sets), 0);
          return (
            <Pressable key={workout.id} onPress={() => router.push(`/workout/${workout.id}`)}>
              <Panel>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <Text style={{ color: C.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{workout.title}</Text>
                  <Label>{new Date(workout.date).toLocaleDateString('pl-PL')}</Label>
                </View>
                <Text style={{ color: C.muted, marginTop: 9 }}>{workout.exercises.length} ćwiczeń · {totalSets} serii</Text>
                <Text style={{ color: C.red, fontSize: 11, fontWeight: '900', marginTop: 12 }}>OTWÓRZ SZCZEGÓŁY  →</Text>
              </Panel>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
