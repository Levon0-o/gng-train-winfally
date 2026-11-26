import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C, Eyebrow, Heading, Panel, Label } from '../../src/components/UI';
import { deleteWorkout, getWorkouts, updateWorkout, Workout } from '../../src/lib/storage';

const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 11, marginTop: 6 } as const;

export default function WorkoutDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getWorkouts().then((items) => setWorkout(items.find((item) => item.id === id) ?? null));
  }, [id]);

  const patchExercise = (exerciseId: string, patch: (exercise: Workout['exercises'][number]) => Workout['exercises'][number]) => {
    setWorkout((current) => current ? ({
      ...current,
      exercises: current.exercises.map((exercise) => exercise.id === exerciseId ? patch(exercise) : exercise),
    }) : current);
  };

  const patchSet = (exerciseId: string, setId: string, key: 'reps' | 'weight', value: string) => {
    if (!workout) return;
    const parsed = Number(value.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) return;
    patchExercise(exerciseId, (exercise) => {
      const sets = (exercise.setDetails ?? []).map((set) => set.id === setId ? { ...set, [key]: parsed } : set);
      return { ...exercise, setDetails: sets, sets: sets.length, reps: sets[0]?.reps ?? 0, weight: sets[0]?.weight ?? 0 };
    });
  };

  const save = async () => {
    if (!workout || !workout.title.trim()) {
      Alert.alert('Brak nazwy', 'Podaj nazwę treningu.');
      return;
    }
    setBusy(true);
    try {
      const normalized = {
        ...workout,
        title: workout.title.trim(),
        exercises: workout.exercises.map((exercise) => {
          const sets = exercise.setDetails ?? [];
          return { ...exercise, sets: sets.length, reps: sets[0]?.reps ?? 0, weight: sets[0]?.weight ?? 0 };
        }),
      };
      await updateWorkout(normalized);
      setWorkout(normalized);
      setEditing(false);
      Alert.alert('Zapisano', 'Zmiany treningu zostały zapisane.');
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać zmian.');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    if (!workout) return;
    Alert.alert('Usunąć trening?', 'Tej operacji nie można cofnąć.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: async () => {
        await deleteWorkout(workout.id);
        router.back();
      } },
    ]);
  };

  const share = async () => {
    if (!workout) return;
    const lines = [
      workout.title,
      new Date(workout.date).toLocaleString('pl-PL'),
      '',
      ...workout.exercises.flatMap((exercise) => [
        exercise.name,
        ...(exercise.setDetails ?? []).map((set, index) => `  Seria ${index + 1}: ${set.reps} powt. · ${set.weight} kg`),
      ]),
      workout.notes ? `\nNotatki: ${workout.notes}` : '',
    ];
    await Share.share({ title: workout.title, message: lines.join('\n') });
  };

  if (!workout) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 22, paddingTop: 58 }}>
        <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900' }}>← WRÓĆ</Text></Pressable>
        <Heading> NIE ZNALEZIONO</Heading>
        <Text style={{ color: C.muted, marginTop: 8 }}>Ten trening mógł zostać usunięty.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← DZIENNIK</Text></Pressable>
        <Eyebrow>SESSION RECORD / DETAILS</Eyebrow>
        <Heading>{editing ? 'EDYTUJ TRENING' : 'SZCZEGÓŁY'}</Heading>
        <Text style={{ color: C.muted, marginTop: 5 }}>{new Date(workout.date).toLocaleString('pl-PL')}</Text>

        <Label style={{ marginTop: 22 }}>NAZWA TRENINGU</Label>
        {editing ? <TextInput value={workout.title} onChangeText={(title) => setWorkout({ ...workout, title })} style={field} /> : <Text style={{ color: C.text, fontSize: 20, fontWeight: '900', marginTop: 8 }}>{workout.title}</Text>}

        {workout.exercises.map((exercise) => (
          <Panel key={exercise.id} style={{ marginTop: 12 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>{exercise.name}</Text>
            {(exercise.setDetails ?? []).map((set, index) => (
              <View key={set.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
                <Text style={{ color: C.muted, flex: 1 }}>Seria {index + 1}</Text>
                {editing ? (
                  <View style={{ flexDirection: 'row', gap: 7 }}>
                    <TextInput value={String(set.reps)} onChangeText={(value) => patchSet(exercise.id, set.id, 'reps', value)} keyboardType="number-pad" style={[field, { width: 66, marginTop: 0, padding: 8, textAlign: 'center' }]} />
                    <TextInput value={String(set.weight)} onChangeText={(value) => patchSet(exercise.id, set.id, 'weight', value)} keyboardType="decimal-pad" style={[field, { width: 76, marginTop: 0, padding: 8, textAlign: 'center' }]} />
                  </View>
                ) : <Text style={{ color: C.steel, fontWeight: '800' }}>{set.reps} powt. · {set.weight} kg</Text>}
              </View>
            ))}
          </Panel>
        ))}

        <Label style={{ marginTop: 22 }}>NOTATKI</Label>
        {editing ? <TextInput value={workout.notes} onChangeText={(notes) => setWorkout({ ...workout, notes })} multiline style={[field, { minHeight: 90, textAlignVertical: 'top' }]} /> : <Text style={{ color: workout.notes ? C.steel : C.muted, marginTop: 8 }}>{workout.notes || 'Brak notatek.'}</Text>}

        {editing ? (
          <Pressable disabled={busy} onPress={save} style={{ backgroundColor: C.red, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 22, opacity: busy ? 0.6 : 1 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{busy ? 'ZAPISYWANIE...' : 'ZAPISZ ZMIANY'}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={() => setEditing(true)} style={{ backgroundColor: C.red, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 22 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>EDYTUJ TRENING</Text>
            </Pressable>
            <Pressable onPress={share} style={{ borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 9 }}>
              <Text style={{ color: C.steel, fontWeight: '800' }}>UDOSTĘPNIJ TRENING</Text>
            </Pressable>
            <Pressable onPress={remove} style={{ borderWidth: 1, borderColor: '#713B3B', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 9 }}>
              <Text style={{ color: '#E87979', fontWeight: '800' }}>USUŃ TRENING</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
