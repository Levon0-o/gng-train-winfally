import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Label, Panel, setAccentTheme } from '../src/components/UI';
import { DEFAULT_PROFILE, getProfile, saveProfile, UserProfile, AccentTheme } from '../src/lib/profile';
import { getWorkouts, replaceWorkouts, Workout } from '../src/lib/storage';

const days = ['NIEDZIELA', 'PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA'];
const themes: Array<{ id: AccentTheme; label: string; color: string }> = [
  { id: 'red', label: 'COMMAND RED', color: '#E34B4B' },
  { id: 'blue', label: 'TACTICAL BLUE', color: '#4C9AD6' },
  { id: 'green', label: 'FIELD GREEN', color: '#55B88A' },
  { id: 'amber', label: 'INDUSTRIAL AMBER', color: '#D69A4C' },
];

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [backupText, setBackupText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { getProfile().then(setProfile); }, []);

  const persistProfile = async (next: UserProfile) => {
    setProfile(next);
    setAccentTheme(next.accentTheme);
    try {
      await saveProfile(next);
    } catch {
      Alert.alert('Błąd zapisu', 'Nie udało się zapisać ustawień.');
    }
  };

  const makeBackup = async () => {
    try {
      const workouts = await getWorkouts();
      const currentProfile = await getProfile();
      const payload = {
        app: 'GYM_COMMAND',
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        profile: currentProfile,
        workouts,
      };
      await Share.share({
        title: 'GYM COMMAND — kopia zapasowa',
        message: JSON.stringify(payload, null, 2),
      });
    } catch {
      Alert.alert('Eksport nieudany', 'Nie udało się przygotować kopii zapasowej.');
    }
  };

  const restoreBackup = () => {
    let parsed: any;
    try {
      parsed = JSON.parse(backupText.trim());
    } catch {
      Alert.alert('Nieprawidłowy JSON', 'Wklej pełną zawartość kopii zapasowej.');
      return;
    }
    const validWorkout = (item: any): item is Workout =>
      item && typeof item.id === 'string' && typeof item.date === 'string'
      && typeof item.title === 'string' && Array.isArray(item.exercises)
      && item.exercises.every((exercise: any) => exercise && typeof exercise.id === 'string'
        && typeof exercise.name === 'string' && Number.isFinite(exercise.sets)
        && Number.isFinite(exercise.reps) && Number.isFinite(exercise.weight));
    if (parsed?.app !== 'GYM_COMMAND' || parsed?.formatVersion !== 1
      || !Array.isArray(parsed.workouts) || !parsed.workouts.every(validWorkout)
      || !parsed.profile || typeof parsed.profile.displayName !== 'string') {
      Alert.alert('Nieobsługiwana kopia', 'Plik nie wygląda na poprawną kopię GYM COMMAND.');
      return;
    }
    Alert.alert(
      'Przywrócić kopię?',
      'Zapisane treningi i profil na tym urządzeniu zostaną zastąpione danymi z kopii.',
      [
        { text: 'ANULUJ', style: 'cancel' },
        { text: 'PRZYWRÓĆ', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            await replaceWorkouts(parsed.workouts);
            const nextProfile: UserProfile = {
              ...DEFAULT_PROFILE,
              ...parsed.profile,
            };
            await saveProfile(nextProfile);
            setProfile(await getProfile());
            setAccentTheme(nextProfile.accentTheme);
            setBackupText('');
            Alert.alert('Przywrócono kopię', 'Dane zostały wczytane na tym urządzeniu.');
          } catch {
            Alert.alert('Błąd przywracania', 'Nie udało się wczytać kopii.');
          } finally {
            setBusy(false);
          }
        }},
      ],
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
      <Eyebrow>SYSTEM CONFIGURATION / 09</Eyebrow>
      <Heading>USTAWIENIA</Heading>
      <Text style={{ color: C.muted, marginTop: 5, marginBottom: 17 }}>Motyw, przypomnienia i kopie danych.</Text>

      <Eyebrow> / WYGLĄD</Eyebrow>
      <Panel style={{ marginTop: 10, marginBottom: 16 }}>
        <Label>KOLOR AKCENTU</Label>
        <View style={{ gap: 8, marginTop: 12 }}>
          {themes.map((theme) => {
            const active = profile.accentTheme === theme.id;
            return (
              <Pressable key={theme.id} onPress={() => persistProfile({ ...profile, accentTheme: theme.id })} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 9, backgroundColor: active ? C.panel2 : '#121518', borderWidth: 1, borderColor: active ? theme.color : C.line }}>
                <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: theme.color, marginRight: 10 }} />
                <Text style={{ color: C.text, flex: 1, fontWeight: '900', fontSize: 11 }}>{theme.label}</Text>
                <Text style={{ color: theme.color, fontWeight: '900' }}>{active ? 'AKTYWNY ✓' : 'WYBIERZ'}</Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>

      <Eyebrow> / PRZYPOMNIENIE W APLIKACJI</Eyebrow>
      <Panel style={{ marginTop: 10, marginBottom: 16 }}>
        <Text style={{ color: C.text, fontWeight: '900' }}>PLAN AKTYWNOŚCI</Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>Ustaw dzień i godzinę, a pulpit pokaże przypomnienie, gdy otworzysz aplikację. To nie wysyła powiadomień, gdy aplikacja jest zamknięta.</Text>
        <Pressable onPress={() => persistProfile({ ...profile, reminderEnabled: !profile.reminderEnabled })} style={{ padding: 13, borderRadius: 9, backgroundColor: profile.reminderEnabled ? '#23382D' : C.panel2, borderWidth: 1, borderColor: profile.reminderEnabled ? C.green : C.line, marginTop: 13 }}>
          <Text style={{ color: profile.reminderEnabled ? C.green : C.steel, fontWeight: '900', textAlign: 'center' }}>{profile.reminderEnabled ? 'PRZYPOMNIENIE WŁĄCZONE' : 'WŁĄCZ PRZYPOMNIENIE'}</Text>
        </Pressable>
        <Label style={{ marginTop: 15 }}>DZIEŃ TYGODNIA</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
          {days.map((day, index) => {
            const active = profile.reminderDay === index;
            return <Pressable key={day} onPress={() => persistProfile({ ...profile, reminderDay: index })} style={{ width: '31%', paddingVertical: 10, alignItems: 'center', borderRadius: 7, backgroundColor: active ? '#3A2022' : C.panel2, borderWidth: 1, borderColor: active ? C.red : C.line }}><Text style={{ color: active ? '#FFFFFF' : C.steel, fontSize: 9, fontWeight: '900' }}>{day}</Text></Pressable>;
          })}
        </View>
        <Label style={{ marginTop: 15 }}>GODZINA (HH:MM)</Label>
        <TextInput value={profile.reminderTime} onChangeText={(value) => setProfile((current) => ({ ...current, reminderTime: value.slice(0, 5) }))} onEndEditing={() => {
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.reminderTime)) {
            Alert.alert('Nieprawidłowa godzina', 'Wpisz godzinę w formacie 18:00.');
            setProfile((current) => ({ ...current, reminderTime: '18:00' }));
          } else {
            saveProfile(profile).catch(() => Alert.alert('Błąd zapisu', 'Nie udało się zapisać godziny.'));
          }
        }} placeholder="18:00" placeholderTextColor="#687078" keyboardType="numbers-and-punctuation" style={{ backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 12, marginTop: 7 }} />
      </Panel>

      <Eyebrow> / BACKUP & RESTORE</Eyebrow>
      <Panel style={{ marginTop: 10 }}>
        <Text style={{ color: C.text, fontWeight: '900' }}>KOPIA ZAPASOWA</Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6 }}>Eksport obejmuje historię treningów i profil. Udostępnij lub skopiuj wygenerowany tekst JSON i przechowuj go w bezpiecznym miejscu.</Text>
        <Pressable onPress={makeBackup} style={{ backgroundColor: C.red, borderRadius: 9, padding: 14, alignItems: 'center', marginTop: 13 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>EKSPORTUJ KOPIĘ JSON</Text>
        </Pressable>
        <Label style={{ marginTop: 18 }}>PRZYWRACANIE Z KOPII</Label>
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 5 }}>Wklej wcześniej wyeksportowany JSON. Przywracanie zastąpi obecne treningi i ustawienia.</Text>
        <TextInput value={backupText} onChangeText={setBackupText} multiline textAlignVertical="top" placeholder="Wklej tutaj zawartość kopii JSON..." placeholderTextColor="#687078" style={{ minHeight: 125, backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 12, marginTop: 9, fontSize: 11 }} />
        <Pressable disabled={busy || !backupText.trim()} onPress={restoreBackup} style={{ backgroundColor: backupText.trim() && !busy ? C.panel2 : '#171A1D', borderWidth: 1, borderColor: C.line, borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 10, opacity: backupText.trim() && !busy ? 1 : 0.45 }}>
          <Text style={{ color: C.text, fontWeight: '900' }}>{busy ? 'PRZYWRACANIE...' : 'PRZYWRÓĆ Z KOPII'}</Text>
        </Pressable>
      </Panel>
      <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 14 }}>Kopia jest ręczna i przechowywana poza aplikacją. Nie ma jeszcze automatycznej synchronizacji w chmurze.</Text>
    </ScrollView>
  );
}
