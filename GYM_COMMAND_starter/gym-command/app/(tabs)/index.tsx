import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { C, Screen, Eyebrow, Heading, Panel, Label, setAccentTheme } from '../../src/components/UI';
import { getWorkouts, Workout } from '../../src/lib/storage';
import { DEFAULT_PROFILE, getProfile, UserProfile } from '../../src/lib/profile';

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  useFocusEffect(useCallback(() => {
    getWorkouts().then(setWorkouts);
    getProfile().then((nextProfile) => { setProfile(nextProfile); setAccentTheme(nextProfile.accentTheme); });
  }, []));
  const sets = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, exercise) => s + (exercise.setDetails?.length ?? exercise.sets), 0), 0);
  const latest = workouts[0];
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const weekCount = workouts.filter((workout) => { const date = new Date(workout.date); return date >= weekStart && date < weekEnd; }).length;
  const reminderDayName = ['niedzielę', 'poniedziałek', 'wtorek', 'środę', 'czwartek', 'piątek', 'sobotę'][profile.reminderDay];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <Eyebrow>PERSONAL TRAINING SYSTEM / 01</Eyebrow>
        <Heading>GYM COMMAND</Heading>
        <Text style={{ color: C.muted, marginTop: 5, fontSize: 12, letterSpacing: 1 }}>{profile.displayName.toUpperCase()} · DISCIPLINE IS A SYSTEM.</Text>
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
        <Panel style={{ marginTop: 10 }}>
          <Label>PODSUMOWANIE TYGODNIA</Label>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <Text style={{ color: C.text, fontSize: 28, fontWeight: '900' }}>{weekCount}</Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>z {profile.weeklyGoal} zaplanowanych sesji</Text>
          </View>
          <View style={{ height: 6, backgroundColor: C.panel2, borderRadius: 5, overflow: 'hidden', marginTop: 8 }}><View style={{ height: 6, width: `${Math.min(100, weekCount / profile.weeklyGoal * 100)}%`, backgroundColor: C.red }} /></View>
          <Text style={{ color: C.muted, fontSize: 10, marginTop: 7 }}>Cel jest orientacyjny. Dostosuj aktywność do regeneracji i zaleceń specjalisty.</Text>
        </Panel>
        {profile.reminderEnabled ? <Panel style={{ marginTop: 10, borderColor: C.red }}>
          <Label>POWIADOMIENIE SYSTEMOWE</Label>
          <Text style={{ color: C.text, fontWeight: '900', marginTop: 7 }}>Plan na {reminderDayName} · {profile.reminderTime}</Text>
          <Text style={{ color: C.muted, fontSize: 10, marginTop: 5 }}>Cotygodniowe powiadomienie systemowe. Wymaga zgody na powiadomienia w ustawieniach urządzenia.</Text>
        </Panel> : null}
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
        <Pressable onPress={() => router.push('/calendar')} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>▦ KALENDARZ I KAMIENIE MILOWE</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Tygodniowe podsumowanie, dni treningowe i osiągnięcia</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/profile')} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>◉ PROFIL ZAWODNIKA</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Nazwa profilu i orientacyjny cel tygodniowy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/stats') style={{ backgroundColor: '#22272C', borderWidth: 1, borderColor: C.red, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>↗ ANALIZA PROGRESU</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>Rekordy, historia ćwiczeń i porównanie sesji</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/rest')} style={{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 17, marginTop: 10 }}>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', letterSpacing: 1 }}>◷ TIMER PRZERWY</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>60, 90 lub 120 sekund · pauza i reset</Text>
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
        <Text style={{ color: '#626970', fontSize: 10, marginTop: 22, textAlign: 'center', letterSpacing: 1 }}>GYM COMMAND // BUILD 010</Text>
      </ScrollView>
    </Screen>
  );
}
