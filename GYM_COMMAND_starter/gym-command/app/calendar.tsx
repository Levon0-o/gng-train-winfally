import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { C, Eyebrow, Heading, Label, Panel, setAccentTheme } from '../src/components/UI';
import { getWorkouts, Workout } from '../src/lib/storage';
import { DEFAULT_PROFILE, getProfile, UserProfile } from '../src/lib/profile';

const dayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const mondayStart = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
const monthLabel = (date: Date) => date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

export default function CalendarScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => new Date());

  useFocusEffect(useCallback(() => {
    getWorkouts().then(setWorkouts);
    getProfile().then((next) => { setProfile(next); setAccentTheme(next.accentTheme); });
  }, []));

  const workoutDays = useMemo(() => {
    const map = new Map<string, Workout[]>();
    workouts.forEach((workout) => {
      const key = dayKey(new Date(workout.date));
      map.set(key, [...(map.get(key) ?? []), workout]);
    });
    return map;
  }, [workouts]);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = mondayStart(first);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const weekStart = mondayStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const thisWeek = workouts.filter((workout) => {
    const date = new Date(workout.date);
    return date >= weekStart && date < weekEnd;
  });
  const selectedWorkouts = workoutDays.get(dayKey(selected)) ?? [];
  const totalSets = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, exercise) => s + (exercise.setDetails?.length ?? exercise.sets), 0), 0);
  const totalReps = workouts.reduce((sum, workout) => sum + workout.exercises.reduce((s, exercise) => s + (exercise.setDetails?.reduce((a, set) => a + set.reps, 0) ?? exercise.reps * exercise.sets), 0), 0);
  const milestones = [
    { title: 'Pierwszy trening', detail: 'Pierwszy zapis w dzienniku', done: workouts.length >= 1 },
    { title: '5 treningów', detail: 'Pięć zapisanych sesji', done: workouts.length >= 5 },
    { title: '10 treningów', detail: 'Dziesięć zapisanych sesji', done: workouts.length >= 10 },
    { title: '25 treningów', detail: 'Dwadzieścia pięć zapisanych sesji', done: workouts.length >= 25 },
    { title: '100 serii', detail: 'Sto zapisanych serii', done: totalSets >= 100 },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 36 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
      <Eyebrow>CONSISTENCY TRACKER / 08</Eyebrow>
      <Heading>KALENDARZ</Heading>
      <Text style={{ color: C.muted, marginTop: 5, marginBottom: 16 }}>Historia aktywności i spokojne podsumowanie tygodnia.</Text>

      <Panel style={{ marginBottom: 14 }}>
        <Label>TEN TYDZIEŃ · PONIEDZIAŁEK–NIEDZIELA</Label>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <Text style={{ color: C.text, fontSize: 34, fontWeight: '900' }}>{thisWeek.length}</Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>zapisanych treningów</Text>
        </View>
        <View style={{ height: 8, backgroundColor: C.panel2, borderRadius: 8, overflow: 'hidden', marginTop: 10 }}>
          <View style={{ height: 8, width: `${Math.min(100, (thisWeek.length / profile.weeklyGoal) * 100)}%`, backgroundColor: C.red, borderRadius: 8 }} />
        </View>
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>Twój orientacyjny cel: {profile.weeklyGoal} treningi/tydzień. To punkt odniesienia, nie obowiązek — odpoczynek też jest częścią planu.</Text>
      </Panel>

      <Panel style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Pressable onPress={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} style={{ padding: 8 }}><Text style={{ color: C.red, fontSize: 20, fontWeight: '900' }}>‹</Text></Pressable>
          <Text style={{ color: C.text, fontSize: 15, fontWeight: '900', textTransform: 'capitalize' }}>{monthLabel(month)}</Text>
          <Pressable onPress={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} style={{ padding: 8 }}><Text style={{ color: C.red, fontSize: 20, fontWeight: '900' }}>›</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((day, index) => <Text key={index} style={{ flex: 1, textAlign: 'center', color: C.muted, fontSize: 10, fontWeight: '900' }}>{day}</Text>)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((date) => {
            const inMonth = date.getMonth() === month.getMonth();
            const isSelected = sameDay(date, selected);
            const isToday = sameDay(date, new Date());
            const hasWorkout = (workoutDays.get(dayKey(date))?.length ?? 0) > 0;
            return (
              <Pressable key={dayKey(date)} onPress={() => setSelected(date)} style={{ width: '14.2857%', height: 45, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? C.red : 'transparent', borderWidth: isToday && !isSelected ? 1 : 0, borderColor: C.red }}>
                  <Text style={{ color: inMonth ? (isSelected ? '#FFFFFF' : C.text) : '#555D64', fontSize: 12, fontWeight: isToday || isSelected ? '900' : '600' }}>{date.getDate()}</Text>
                </View>
                {hasWorkout ? <View style={{ position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? C.red : C.green }} /> : null}
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
          <Text style={{ color: C.muted, fontSize: 10 }}>Zapisany trening</Text>
          <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: C.red, marginLeft: 10 }} />
          <Text style={{ color: C.muted, fontSize: 10 }}>Dzisiaj</Text>
        </View>
      </Panel>

      <Eyebrow> / {selected.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</Eyebrow>
      {selectedWorkouts.length ? selectedWorkouts.map((workout) => (
        <Pressable key={workout.id} onPress={() => router.push(`/workout/${workout.id}`)} style={{ marginTop: 9 }}>
          <Panel>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 15 }}>{workout.title}</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>{workout.exercises.length} ćwiczeń · {workout.exercises.reduce((s, exercise) => s + (exercise.setDetails?.length ?? exercise.sets), 0)} serii</Text>
            <Text style={{ color: C.red, fontWeight: '900', fontSize: 10, marginTop: 10 }}>OTWÓRZ TRENING →</Text>
          </Panel>
        </Pressable>
      )) : <Panel style={{ marginTop: 9 }}><Text style={{ color: C.muted, fontSize: 12 }}>Brak zapisanych treningów w tym dniu.</Text></Panel>}

      <Eyebrow> / KAMIENIE MILOWE</Eyebrow>
      <Panel style={{ marginTop: 10 }}>
        {milestones.map((milestone, index) => (
          <View key={milestone.title} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: index === milestones.length - 1 ? 0 : 1, borderBottomColor: C.line, gap: 11 }}>
            <View style={{ width: 25, height: 25, borderRadius: 13, backgroundColor: milestone.done ? '#23382D' : C.panel2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: milestone.done ? C.green : C.muted, fontWeight: '900' }}>{milestone.done ? '✓' : '·'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 12, fontWeight: '900' }}>{milestone.title}</Text>
              <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{milestone.detail}</Text>
            </View>
            <Text style={{ color: milestone.done ? C.green : C.muted, fontSize: 9, fontWeight: '900' }}>{milestone.done ? 'OSIĄGNIĘTO' : 'W TOKU'}</Text>
          </View>
        ))}
      </Panel>

      <Eyebrow> / ŁĄCZNA AKTYWNOŚĆ</Eyebrow>
      <View style={{ flexDirection: 'row', gap: 9, marginTop: 10 }}>
        <Panel style={{ flex: 1 }}><Label>TRENINGI</Label><Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{workouts.length}</Text></Panel>
        <Panel style={{ flex: 1 }}><Label>SERIE</Label><Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{totalSets}</Text></Panel>
        <Panel style={{ flex: 1 }}><Label>POWTÓRZENIA</Label><Text style={{ color: C.text, fontSize: 25, fontWeight: '900', marginTop: 5 }}>{totalReps}</Text></Panel>
      </View>
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 14 }}>Statystyki pokazują wyłącznie dane zapisane w aplikacji. Brak treningu w kalendarzu nie oznacza porażki — regeneracja jest normalną częścią aktywności.</Text>
    </ScrollView>
  );
}
