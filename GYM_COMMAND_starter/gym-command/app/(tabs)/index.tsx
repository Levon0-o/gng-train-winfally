import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel, Label } from '../../src/components/UI';
import { getWorkouts, Workout } from '../../src/lib/storage';

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  useFocusEffect(useCallback(() => { getWorkouts().then(setWorkouts); }, []));
  const sets = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, exercise) => s + (exercise.setDetails?.length ?? exercise.sets), 0), 0);
  const latest = workouts[0];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Eyebrow>PERSONAL TRAINING SYSTEM / 01</Eyebrow>
        <Heading>GYM COMMAND</Heading>
        <Text style={{ color: C.muted, marginTop: 5, fontSize: 12, letterSpacing: 1 }}>DISCIPLINE IS A SYSTEM.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 25 }}>
          <Panel style={{ flex: 1 }}>
            <Label>UKOŃCZONE TRENINGI</Label>
            <Text style={{ color: C.text, fontSize: 34, fontWeight: '900', marginTop: 8 }}>{workouts.length}</Text>
          </Panel>
          <Panel style={{ flex: 1 }}>
            <Label>ZAPISANE SERIE</Label>
            <Text style={{ color: C.text, fontSize: 34, fontWeight: '900', marginTop: 8 }}>{sets}</Text>
          </Panel>
        </View>
        <Eyebrow> / AKCJA</Eyebrow>
        <Pressable onPress={() => router.push('/log')} style={{ backgroundColor: C.red, borderRadius: 12, padding: 18, marginTop: 10 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>+ ZAPISZ TRENING</Text>
          <Text style={{ color: '#FFE7E7', fontSize: 12, marginTop: 5 }}>Zapisuj każdą serię osobno</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/plans')} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>▤ BIBLIOTEKA PLANÓW</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Wybierz szablon i zapisuj ćwiczenia krok po kroku</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/exercises')} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>▦ BIBLIOTEKA ĆWICZEŃ</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Wyszukiwarka, instrukcje ustawienia i własne ćwiczenia</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/stats')} style={{ backgroundColor: '#22272C', borderWidth: 1, borderColor: C.red, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>↗ ANALIZA PROGRESU</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Rekordy, historia ćwiczeń i porównanie sesji</Text>
        </Pressable>
        <Eyebrow> / OSTATNIA AKTYWNOŚĆ</Eyebrow>
        <Panel style={{ marginTop: 10 }}>
          {latest ? <>
            <Text style={{ color: C.text, fontSize: 17, fontWeight: '800' }}>{latest.title}</Text>
            <Text style={{ color: C.muted, marginTop: 5 }}>{new Date(latest.date).toLocaleDateString('pl-PL')} · {latest.exercises.length} ćwiczeń</Text>
          </> : <>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>Brak zapisanych treningów</Text>
            <Text style={{ color: C.muted, marginTop: 6, lineHeight: 19 }}>Pierwszy trening pojawi się tutaj po zapisaniu go w dzienniku.</Text>
          </>}
        </Panel>
        <Eyebrow> / STATUS SYSTEMU</Eyebrow>
        <Panel style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: C.text, fontWeight: '700' }}>Pamięć lokalna</Text>
            <Text style={{ color: C.green, fontWeight: '800', fontSize: 11 }}>AKTYWNA</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Dane są zapisywane na tym urządzeniu. Synchronizację w chmurze dodamy później.</Text>
        </Panel>
        <Text style={{ color: '#626970', fontSize: 10, marginTop: 22, textAlign: 'center', letterSpacing: 1 }}>GYM COMMAND // BUILD 005</Text>
      </ScrollView>
    </Screen>
  );
}
