import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Panel, Label } from '../src/components/UI';
import { saveWorkout, ExerciseEntry } from '../src/lib/storage';

const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 12, marginTop: 6 } as const;

export default function LogWorkout() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('0');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  const addExercise = () => {
    const s = Number(sets), r = Number(reps), w = Number(weight);
    if (!name.trim() || !Number.isInteger(s) || s < 1 || s > 30 || !Number.isInteger(r) || r < 1 || r > 100 || !Number.isFinite(w) || w < 0 || w > 1000) {
      Alert.alert('Sprawdź dane', 'Wpisz nazwę ćwiczenia oraz prawidłowe serie, powtórzenia i ciężar.');
      return;
    }
    setExercises([...exercises, { id: `${Date.now()}-${Math.random()}`, name: name.trim(), sets: s, reps: r, weight: w }]);
    setName('');
  };

  const finish = async () => {
    if (!title.trim() || exercises.length === 0) {
      Alert.alert('Brak danych', 'Podaj nazwę treningu i dodaj przynajmniej jedno ćwiczenie.');
      return;
    }
    await saveWorkout({ id: `${Date.now()}`, date: new Date().toISOString(), title: title.trim(), notes: notes.trim(), exercises });
    Alert.alert('Zapisano', 'Trening dodany do dziennika.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
        <Eyebrow>SESSION ENTRY / NEW RECORD</Eyebrow>
        <Heading>NOWY TRENING</Heading>
        <Label style={{ marginTop: 22 }}>NAZWA TRENINGU</Label>
        <TextInput value={title} onChangeText={setTitle} placeholder="np. Upper Body A" placeholderTextColor="#687078" style={field} />
        <Panel style={{ marginTop: 20 }}>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>DODAJ ĆWICZENIE</Text>
          <Label style={{ marginTop: 16 }}>NAZWA</Label>
          <TextInput value={name} onChangeText={setName} placeholder="np. Chest Press" placeholderTextColor="#687078" style={field} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}><Label>SERIE</Label><TextInput value={sets} onChangeText={setSets} keyboardType="number-pad" style={field} /></View>
            <View style={{ flex: 1 }}><Label>POWTÓRZENIA</Label><TextInput value={reps} onChangeText={setReps} keyboardType="number-pad" style={field} /></View>
            <View style={{ flex: 1 }}><Label>KG</Label><TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={field} /></View>
          </View>
          <Pressable onPress={addExercise} style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.red, borderRadius: 9, padding: 13, marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: C.text, fontWeight: '900', letterSpacing: 1 }}>+ DODAJ DO TRENINGU</Text>
          </Pressable>
        </Panel>
        <Label style={{ marginTop: 22 }}>DODANE ĆWICZENIA · {exercises.length}</Label>
        {exercises.map((e) => <Panel key={e.id} style={{ marginTop: 8, padding: 12 }}>
          <Text style={{ color: C.text, fontWeight: '800' }}>{e.name}</Text>
          <Text style={{ color: C.muted, marginTop: 4 }}>{e.sets} serie × {e.reps} powt. · {e.weight} kg</Text>
        </Panel>)}
        <Label style={{ marginTop: 22 }}>NOTATKI (OPCJONALNIE)</Label>
        <TextInput value={notes} onChangeText={setNotes} multiline placeholder="Samopoczucie, uwagi, odczucia po treningu..." placeholderTextColor="#687078" style={[field, { minHeight: 82, textAlignVertical: 'top' }]} />
        <Pressable onPress={finish} style={{ backgroundColor: C.red, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>ZAPISZ TRENING</Text>
        </Pressable>
        <Text style={{ color: '#687078', fontSize: 10, marginTop: 14, lineHeight: 15 }}>Aplikacja zapisuje dane treningowe. Nie jest planem rehabilitacji ani zaleceniem doboru obciążeń.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
