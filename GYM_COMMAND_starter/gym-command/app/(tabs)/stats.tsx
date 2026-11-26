import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel, Label } from '../../src/components/UI';
import { getWorkouts, Workout, SetEntry } from '../../src/lib/storage';

type ExerciseSession = {
  workout: Workout;
  sets: SetEntry[];
  topSet: SetEntry;
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

export default function Stats() {
  const [items, setItems] = useState<Workout[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');

  useFocusEffect(useCallback(() => {
    getWorkouts().then(setItems);
  }, []));

  const exerciseNames = useMemo(() => {
    const names = new Map<string, string>();
    items.forEach((workout) => workout.exercises.forEach((exercise) => {
      const key = exercise.name.trim().toLocaleLowerCase();
      if (key && !names.has(key)) names.set(key, exercise.name.trim());
    }));
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [items]);

  const activeName = exerciseNames.includes(selectedExercise) ? selectedExercise : (exerciseNames[0] ?? '');

  const sessions = useMemo<ExerciseSession[]>(() => {
    if (!activeName) return [];
    return items
      .map((workout) => {
        const exercise = workout.exercises.find((entry) => entry.name.trim().toLocaleLowerCase() === activeName.toLocaleLowerCase());
        if (!exercise) return null;
        const sets = exercise.setDetails?.length
          ? exercise.setDetails
          : Array.from({ length: exercise.sets || 0 }, (_, index) => ({
              id: `legacy-${exercise.id}-${index}`,
              reps: exercise.reps || 0,
              weight: exercise.weight || 0,
            }));
        if (!sets.length) return null;
        const topSet = sets.reduce((best, set) => (
          set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps) ? set : best
        ), sets[0]);
        return { workout, sets, topSet };
      })
      .filter((entry): entry is ExerciseSession => entry !== null)
      .sort((a, b) => new Date(b.workout.date).getTime() - new Date(a.workout.date).getTime());
  }, [items, activeName]);

  const allSets = sessions.flatMap((session) => session.sets);
  const bestWeight = allSets.reduce((best, set) => Math.max(best, set.weight), 0);
  const bestReps = allSets.reduce((best, set) => Math.max(best, set.reps), 0);
  const latest = sessions[0];
  const previous = sessions[1];
  const chartSessions = sessions.slice(0, 5).reverse();
  const chartMax = Math.max(1, ...chartSessions.map((session) => session.topSet.weight));

  const exerciseCount = items.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const setCount = items.reduce((sum, workout) => sum + workout.exercises.reduce((count, exercise) => count + (exercise.setDetails?.length ?? exercise.sets), 0), 0);
  const totalReps = items.reduce((sum, workout) => sum + workout.exercises.reduce((count, exercise) => count + (exercise.setDetails?.reduce((s, set) => s + set.reps, 0) ?? exercise.reps * exercise.sets), 0), 0);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Eyebrow>PERFORMANCE DATA / 05</Eyebrow>
        <Heading>PROGRES</Heading>
        <Text style={{ color: C.muted, marginTop: 5, marginBottom: 18 }}>Dane z zapisanych sesji. Porównuj wyniki bez presji na dokładanie ciężaru.</Text>

        <Eyebrow> / WYBIERZ ĆWICZENIE</Eyebrow>
        {exerciseNames.length === 0 ? (
          <Panel style={{ marginTop: 10 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>Brak danych do analizy</Text>
            <Text style={{ color: C.muted, marginTop: 7, lineHeight: 19 }}>Zapisz trening z co najmniej jednym ćwiczeniem, a jego historię i rekordy zobaczysz tutaj.</Text>
          </Panel>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
              {exerciseNames.map((name) => {
                const active = name === activeName;
                return (
                  <Pressable key={name} onPress={() => setSelectedExercise(name)} style={{ backgroundColor: active ? '#3A2022' : C.panel, borderWidth: 1, borderColor: active ? C.red : C.line, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Text style={{ color: active ? C.text : C.steel, fontSize: 12, fontWeight: '800' }}>{name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Eyebrow> / NAJLEPSZE ZAPISANE WYNIKI</Eyebrow>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Panel style={{ flex: 1 }}>
                <Label>NAJWIĘKSZY CIĘŻAR</Label>
                <Text style={{ color: C.text, fontSize: 27, fontWeight: '900', marginTop: 7 }}>{bestWeight} kg</Text>
              </Panel>
              <Panel style={{ flex: 1 }}>
                <Label>NAJWIĘCEJ POWTÓRZEŃ</Label>
                <Text style={{ color: C.text, fontSize: 27, fontWeight: '900', marginTop: 7 }}>{bestReps}</Text>
              </Panel>
            </View>

            <Eyebrow> / OSTATNIE SESJE · TOP SET</Eyebrow>
            <Panel style={{ marginTop: 10 }}>
              {chartSessions.length === 0 ? <Text style={{ color: C.muted }}>Brak zapisów.</Text> : chartSessions.map((session) => (
                <View key={session.workout.id} style={{ marginBottom: 13 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: C.steel, fontSize: 11 }}>{formatDate(session.workout.date)}</Text>
                    <Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>{session.topSet.weight} kg · {session.topSet.reps} powt.</Text>
                  </View>
                  <View style={{ height: 9, backgroundColor: C.panel2, borderRadius: 8, overflow: 'hidden' }}>
                    <View style={{ height: 9, width: `${Math.max(3, (session.topSet.weight / chartMax) * 100)}%`, backgroundColor: C.red, borderRadius: 8 }} />
                  </View>
                </View>
              ))}
              <Text style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Wykres pokazuje największy zapisany ciężar z każdej z maksymalnie 5 ostatnich sesji.</Text>
            </Panel>

            <Eyebrow> / PORÓWNANIE SESJI</Eyebrow>
            <Panel style={{ marginTop: 10 }}>
              {latest && previous ? (
                <>
                  <Text style={{ color: C.steel, fontSize: 12 }}>OSTATNIA SESJA · {formatDate(latest.workout.date)}</Text>
                  <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>{latest.topSet.weight} kg × {latest.topSet.reps}</Text>
                  <View style={{ height: 1, backgroundColor: C.line, marginVertical: 12 }} />
                  <Text style={{ color: C.steel, fontSize: 12 }}>POPRZEDNIA SESJA · {formatDate(previous.workout.date)}</Text>
                  <Text style={{ color: C.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>{previous.topSet.weight} kg × {previous.topSet.reps}</Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Porównanie dotyczy najlepszego zestawu z obu zapisów. Różne ustawienia maszyny, technika i samopoczucie mogą wpływać na wynik.</Text>
                </>
              ) : (
                <Text style={{ color: C.muted, lineHeight: 19 }}>Zapisz jeszcze jedną sesję tego ćwiczenia, aby porównać dwa treningi.</Text>
              )}
            </Panel>

            <Eyebrow> / HISTORIA ĆWICZENIA</Eyebrow>
            {sessions.map((session) => (
              <Panel key={session.workout.id} style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={{ color: C.text, fontWeight: '900', flex: 1 }}>{session.workout.title}</Text>
                  <Label>{formatDate(session.workout.date)}</Label>
                </View>
                {session.sets.map((set, index) => (
                  <View key={set.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ color: C.muted, fontSize: 12 }}>Seria {index + 1}</Text>
                    <Text style={{ color: C.steel, fontSize: 12, fontWeight: '800' }}>{set.weight} kg × {set.reps}</Text>
                  </View>
                ))}
              </Panel>
            ))}
          </>
        )}

        <Eyebrow> / PODSUMOWANIE OGÓLNE</Eyebrow>
        <Panel style={{ marginTop: 10, marginBottom: 10 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '800' }}>TRENINGI</Text>
          <Text style={{ color: C.text, fontSize: 30, fontWeight: '900', marginTop: 4 }}>{items.length}</Text>
        </Panel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Panel style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800' }}>ĆWICZENIA</Text>
            <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{exerciseCount}</Text>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800' }}>SERIE</Text>
            <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{setCount}</Text>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800' }}>POWTÓRZENIA</Text>
            <Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{totalReps}</Text>
          </Panel>
        </View>
      </ScrollView>
    </Screen>
  );
}
