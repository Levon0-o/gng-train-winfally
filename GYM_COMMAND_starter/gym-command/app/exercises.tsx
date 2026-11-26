import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Label, Panel } from '../src/components/UI';
import { BUILT_IN_EXERCISES, ExerciseCategory, ExerciseInfo, getCustomExercises, saveCustomExercise } from '../src/lib/exercises';

const categories: Array<'WSZYSTKIE' | ExerciseCategory> = ['WSZYSTKIE', 'KLATKA', 'PLECY', 'BARKI', 'RAMIONA', 'CORE', 'NOGI', 'WŁASNE'];
const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 12, marginTop: 6 } as const;

export default function ExerciseLibrary() {
  const [custom, setCustom] = useState<ExerciseInfo[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'WSZYSTKIE' | ExerciseCategory>('WSZYSTKIE');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEquipment, setNewEquipment] = useState('Dowolny sprzęt');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => { getCustomExercises().then(setCustom); }, []);

  const allExercises = useMemo(() => [...custom, ...BUILT_IN_EXERCISES], [custom]);
  const filtered = useMemo(() => allExercises.filter((item) => {
    const matchesCategory = category === 'WSZYSTKIE' || item.category === category;
    const search = query.trim().toLocaleLowerCase();
    const matchesSearch = !search || [item.name, item.category, item.equipment, item.description].some((value) => value.toLocaleLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  }), [allExercises, category, query]);

  const addCustom = async () => {
    if (newName.trim().length < 2) {
      Alert.alert('Nazwa jest za krótka', 'Wpisz nazwę ćwiczenia.');
      return;
    }
    const exercise: ExerciseInfo = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      category: 'WŁASNE',
      equipment: newEquipment.trim() || 'Nie określono',
      description: newDescription.trim() || 'Własne ćwiczenie dodane do biblioteki.',
      setup: ['Uzupełnij sposób ustawienia sprzętu zgodnie z instrukcją urządzenia lub wskazówkami instruktora.'],
      cues: ['Zapisuj tylko ćwiczenia, które znasz i możesz wykonywać bezpiecznie.', 'W razie bólu przerwij ćwiczenie.'],
      custom: true,
    };
    try {
      await saveCustomExercise(exercise);
      setCustom((current) => [exercise, ...current]);
      setNewName('');
      setNewEquipment('Dowolny sprzęt');
      setNewDescription('');
      setShowCreator(false);
      setCategory('WŁASNE');
    } catch {
      Alert.alert('Błąd zapisu', 'Nie udało się dodać ćwiczenia. Spróbuj ponownie.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 38 }} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
      <Eyebrow>EXERCISE DATABASE / 05</Eyebrow>
      <Heading>BIBLIOTEKA ĆWICZEŃ</Heading>
      <Text style={{ color: C.muted, marginTop: 6, marginBottom: 16, lineHeight: 19 }}>Wyszukuj ćwiczenia, sprawdzaj ustawienie sprzętu i zapisuj własne pozycje.</Text>

      <TextInput value={query} onChangeText={setQuery} placeholder="Szukaj ćwiczenia lub sprzętu..." placeholderTextColor="#687078" style={field} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 13 }}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={{ backgroundColor: category === item ? C.red : C.panel2, borderWidth: 1, borderColor: category === item ? C.red : C.line, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 13 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 }}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={() => setShowCreator((value) => !value)} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <Text style={{ color: C.text, fontWeight: '900' }}>{showCreator ? '− ZAMKNIJ FORMULARZ' : '+ DODAJ WŁASNE ĆWICZENIE'}</Text>
      </Pressable>

      {showCreator ? (
        <Panel style={{ marginBottom: 16 }}>
          <Label>NAZWA ĆWICZENIA</Label>
          <TextInput value={newName} onChangeText={setNewName} placeholder="np. Cable Fly" placeholderTextColor="#687078" style={field} />
          <Label style={{ marginTop: 13 }}>SPRZĘT</Label>
          <TextInput value={newEquipment} onChangeText={setNewEquipment} placeholder="Maszyna / hantle / wyciąg..." placeholderTextColor="#687078" style={field} />
          <Label style={{ marginTop: 13 }}>OPIS (OPCJONALNIE)</Label>
          <TextInput value={newDescription} onChangeText={setNewDescription} multiline placeholder="Krótki opis ćwiczenia..." placeholderTextColor="#687078" style={[field, { minHeight: 70, textAlignVertical: 'top' }]} />
          <Pressable onPress={addCustom} style={{ backgroundColor: C.red, borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>ZAPISZ W BIBLIOTECE</Text>
          </Pressable>
        </Panel>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Label>WYNIKI · {filtered.length}</Label>
        <Label>{custom.length} WŁASNYCH</Label>
      </View>
      {filtered.length === 0 ? (
        <Panel><Text style={{ color: C.text, fontWeight: '800' }}>Brak wyników.</Text><Text style={{ color: C.muted, marginTop: 5 }}>Zmień frazę lub kategorię wyszukiwania.</Text></Panel>
      ) : filtered.map((item) => {
        const isOpen = expanded === item.id;
        return (
          <Panel key={item.id} style={{ marginBottom: 9, padding: 14 }}>
            <Pressable onPress={() => setExpanded(isOpen ? null : item.id)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 15, fontWeight: '900' }}>{item.name}</Text>
                  <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginTop: 5 }}>{item.category} · {item.equipment.toUpperCase()}</Text>
                </View>
                <Text style={{ color: C.red, fontSize: 18, fontWeight: '900' }}>{isOpen ? '−' : '+'}</Text>
              </View>
              <Text style={{ color: C.steel, fontSize: 12, lineHeight: 18, marginTop: 10 }}>{item.description}</Text>
            </Pressable>
            {isOpen ? (
              <View style={{ borderTopWidth: 1, borderTopColor: C.line, marginTop: 13, paddingTop: 12 }}>
                <Label>USTAWIENIE</Label>
                {item.setup.map((line, index) => <Text key={index} style={{ color: C.steel, fontSize: 12, lineHeight: 18, marginTop: 7 }}>{index + 1}. {line}</Text>)}
                <Label style={{ marginTop: 14 }}>WSKAZÓWKI</Label>
                {item.cues.map((line, index) => <Text key={index} style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }}>• {line}</Text>)}
              </View>
            ) : null}
          </Panel>
        );
      })}
      <Text style={{ color: '#737B82', fontSize: 10, lineHeight: 16, marginTop: 8 }}>Opisy są ogólnymi wskazówkami obsługi sprzętu. Nie zastępują instrukcji konkretnej maszyny ani instruktażu trenera. Po urazie dobór ćwiczeń i powrót do treningu skonsultuj z lekarzem lub fizjoterapeutą.</Text>
    </ScrollView>
  );
}
