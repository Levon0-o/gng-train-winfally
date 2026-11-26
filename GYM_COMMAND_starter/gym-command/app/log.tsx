import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C, Eyebrow, Heading, Panel, Label } from '../src/components/UI';
import { saveWorkout, ExerciseEntry, SetEntry } from '../src/lib/storage';
import { WORKOUT_TEMPLATES } from '../src/lib/templates';

const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 12, marginTop: 6 } as const;

export default function LogWorkout() {
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const template = WORKOUT_TEMPLATES.find((item) => item.id === templateId);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [draftSets, setDraftSets] = useState<SetEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setName(template.exercises[0] ?? '');
    }
  }, [template?.id]);

  const addSet = () => {
    const r = Number(reps);
    const w = Number(weight.replace(',', '.'));
    if (!Number.isInteger(r) || r < 1 || r > 100 || !Number.isFinite(w) || w < 0 || w > 1000) {
      Alert.alert('Sprawdź dane', 'Powtórzenia muszą wynosić 1–100, a ciężar być prawidłową liczbą.');
      return;
    }
    setDraftSets((current) => [...current, { id: `${Date.now()}-${current.length}`, reps: r, weight: w }]);
  };

  const addExercise = () => {
    if (!name.trim() || draftSets.length === 0) {
      Alert.alert('Brak danych', 'Podaj nazwę ćwiczenia i dodaj przynajmniej jedną serię.');
      return;
    }
    setExercises((current) => [...current, {
      id: `${Date.now()}-${current.length}`,
      name: name.trim(),
      sets: draftSets.length,
      reps: draftSets[0].reps,
      weight: draftSets[0].weight,
      setDetails: draftSets,
    }]);
    setName('');
    setDraftSets([]);
    setReps('10');
    setWeight('0');
  };

  const finish = async () => {
    if (!title.trim() || exercises.length === 0) {
      Alert.alert('Brak danych', 'Podaj nazwę treningu i dodaj przynajmniej jedno ćwiczenie.');
      return;
    }
    try {
      await saveWorkout({ id: `${Date.now()}`, date: new Date().toISOString(), title: title.trim(), notes: notes.trim(), exercises });
      Alert.alert('Zapisano', 'Trening dodany do dziennika.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Błąd zapisu', 'Nie udało się zapisać treningu. Spróbuj ponownie.');
    }
  };

  const remainingExercises = template?.exercises.filter((exercise) => !exercises.some((saved) => saved.name === exercise)) ?? [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
        <Eyebrow>SESSION ENTRY / NEW RECORD</Eyebrow>
        <Heading>NOWY TRENING</Heading>
        <Label style={{ marginTop: 22 }}>NAZWA TRENINGU</Label>
        <TextInput value={title} onChangeText={setTitle} placeholder="np. Upper Body A" placeholderTextColor="#687078" style={field} />

        {template ? (
          <Panel style={{ marginTop: 16 }}>
            <Label>WYBRANY SZABLON · {template.title}</Label>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 18 }}>Wybierz ćwiczenie z listy. Po zapisaniu jego serii wybierz następne.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
              {remainingExercises.map((exercise) => (
                <Pressable key={exercise} onPress={() => { setName(exercise); setDraftSets([]); }} style={{ borderWidth: 1, borderColor: name === exercise ? C.red : C.line, backgroundColor: name === exercise ? '#3A2022' : C.panel2, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 10 }}>
                  <Text style={{ color: name === exercise ? '#FFFFFF' : C.steel, fontSize: 11, fontWeight: '800' }}>{exercise}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: C.green, fontSize: 11, fontWeight: '800', marginTop: 12 }}>ZAPISANO: {exercises.length} / {template.exercises.length} ĆWICZEŃ</Text>
          </Panel>
        ) : null}

        <Panel style={{ marginTop: 16 }}>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>NOWE ĆWICZENIE</Text>
          <Label style={{ marginTop: 16 }}>NAZWA</Label>
          <TextInput value={name} onChangeText={setName} placeholder="np. Chest Press" placeholderTextColor="#687078" style={field} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Label>POWTÓRZENIA</Label>
              <TextInput value={reps} onChangeText={setReps} keyboardType="number-pad" style={field} />
            </View>
            <View style={{ flex: 1 }}>
              <Label>OBCIĄŻENIE (KG)</Label>
              <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={field} />
            </View>
          </View>
          <Pressable onPress={addSet} style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line, borderRadius: 9, padding: 13, marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: C.text, fontWeight: '900' }}>+ DODAJ SERIĘ</Text>
          </Pressable>
          {draftSets.map((set, index) => (
            <View key={set.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Text style={{ color: C.steel }}>SERIA {index + 1}</Text>
              <Text style={{ color: C.text, fontWeight: '800' }}>{set.reps} powt. · {set.weight} kg</Text>
            </View>
          ))}
          <Pressable onPress={addExercise} style={{ backgroundColor: C.red, borderRadius: 9, padding: 13, marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>DODAJ ĆWICZENIE ({draftSets.length} SERII)</Text>
          </Pressable>
        </Panel>

        <Label style={{ marginTop: 22 }}>ĆWICZENIA W TRENINGU · {exercises.length}</Label>
        {exercises.map((exercise) => (
          <Panel key={exercise.id} style={{ marginTop: 8, padding: 12 }}>
            <Text style={{ color: C.text, fontWeight: '800' }}>{exercise.name}</Text>
            {exercise.setDetails?.map((set, index) => (
              <Text key={set.id} style={{ color: C.muted, marginTop: 5 }}>Seria {index + 1}: {set.reps} powt. · {set.weight} kg</Text>
            ))}
          </Panel>
        ))}

        <Label style={{ marginTop: 22 }}>NOTATKI (OPCJONALNIE)</Label>
        <TextInput value={notes} onChangeText={setNotes} multiline placeholder="Samopoczucie, uwagi, odczucia po treningu..." placeholderTextColor="#687078" style={[field, { minHeight: 82, textAlignVertical: 'top' }]} />
        <Pressable onPress={finish} style={{ backgroundColor: C.red, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>ZAPISZ TRENING</Text>
        </Pressable>
        <Text style={{ color: '#687078', fontSize: 10, marginTop: 14, lineHeight: 15 }}>To dziennik treningowy, nie plan rehabilitacji ani zalecenie doboru obciążeń.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
