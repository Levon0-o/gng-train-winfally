import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Label, Panel, setAccentTheme } from '../src/components/UI';
import { DEFAULT_PROFILE, getProfile, saveProfile, UserProfile } from '../src/lib/profile';
import { getWorkouts } from '../src/lib/storage';
import { exportBackup, restoreBackup } from '../src/lib/backup';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { syncWorkoutReminder } from '../src/lib/notifications';

const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 13, marginTop: 7 } as const;
const days = ['NIEDZIELA', 'PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [backupText, setBackupText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProfile().then((next) => { setProfile(next); setAccentTheme(next.accentTheme); });
    getWorkouts().then((items) => setWorkoutCount(items.length));
  }, []);

  const persist = async () => {
    try {
      const next = { ...profile, displayName: profile.displayName.trim() || 'ATHLETE' };
      await saveProfile(next);
      setProfile(next);
      setAccentTheme(next.accentTheme);
      const notice = await syncWorkoutReminder(next);
      setSaved(true);
      Alert.alert('Profil zapisany', notice);
    } catch {
      Alert.alert('Błąd zapisu', 'Nie udało się zapisać profilu.');
    }
  };

  const doExport = async () => {
    try {
      setBusy(true);
      await exportBackup();
    } catch (error) {
      Alert.alert('Eksport nieudany', error instanceof Error ? error.message : 'Nie udało się utworzyć kopii.');
    } finally {
      setBusy(false);
    }
  };

  const pickBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'public.json'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setBackupText(raw);
      Alert.alert('Plik wczytany', 'Sprawdź wybraną kopię i naciśnij PRZYWRÓĆ, aby zaimportować dane.');
    } catch (error) {
      Alert.alert('Nie udało się otworzyć pliku', error instanceof Error ? error.message : 'Spróbuj ponownie.');
    }
  };

  const doRestore = () => {
    if (!backupText.trim()) {
      Alert.alert('Brak kopii', 'Wklej zawartość pliku JSON w pole powyżej.');
      return;
    }
    Alert.alert('Zastąpić obecne dane?', 'Import nadpisze lokalny profil i historię treningów. Najpierw wyeksportuj aktualną kopię, jeśli chcesz ją zachować.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Przywróć kopię', style: 'destructive', onPress: async () => {
        try {
          setBusy(true);
          const count = await restoreBackup(backupText.trim());
          const next = await getProfile();
          setProfile(next);
          setAccentTheme(next.accentTheme);
          setWorkoutCount(count);
          setBackupText('');
          await syncWorkoutReminder(next);
          Alert.alert('Przywrócono kopię', 'Zaimportowano ' + count + ' treningów.');
        } catch (error) {
          Alert.alert('Import nieudany', error instanceof Error ? error.message : 'Plik jest nieprawidłowy.');
        } finally {
          setBusy(false);
        }
      } },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 35 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
      <Eyebrow>ATHLETE CONFIGURATION / 08</Eyebrow>
      <Heading>PROFIL</Heading>
      <Text style={{ color: C.muted, marginTop: 5, marginBottom: 17 }}>Profil, przypomnienia i kopie zapasowe.</Text>

      <Panel>
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#3A2022', borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.red, fontSize: 22, fontWeight: '900' }}>{(profile.displayName.trim()[0] || 'A').toUpperCase()}</Text>
        </View>
        <Label style={{ marginTop: 17 }}>NAZWA WYŚWIETLANA</Label>
        <TextInput value={profile.displayName} onChangeText={(value) => { setProfile((current) => ({ ...current, displayName: value.slice(0, 24) })); setSaved(false); }} placeholder="Wpisz nazwę" placeholderTextColor="#687078" maxLength={24} style={field} />
        <Label style={{ marginTop: 18 }}>CEL TYGODNIOWY</Label>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>Orientacyjny cel liczby sesji — możesz go zmienić w dowolnym momencie.</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = profile.weeklyGoal === value;
            return <Pressable key={value} onPress={() => { setProfile((current) => ({ ...current, weeklyGoal: value })); setSaved(false); }} style={{ flex: 1, paddingVertical: 13, borderRadius: 8, alignItems: 'center', backgroundColor: active ? '#3A2022' : C.panel2, borderWidth: 1, borderColor: active ? C.red : C.line }}><Text style={{ color: active ? '#FFFFFF' : C.steel, fontWeight: '900' }}>{value}</Text></Pressable>;
          })}
        </View>
        <Label style={{ marginTop: 20 }}>COTYGODNIOWE POWIADOMIENIE</Label>
        <Pressable onPress={() => { setProfile((current) => ({ ...current, reminderEnabled: !current.reminderEnabled })); setSaved(false); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, backgroundColor: C.panel2, borderRadius: 9, marginTop: 8, borderWidth: 1, borderColor: profile.reminderEnabled ? C.red : C.line }}>
          <Text style={{ color: C.text, fontWeight: '800' }}>Przypomnienie systemowe</Text>
          <Text style={{ color: profile.reminderEnabled ? C.green : C.muted, fontWeight: '900' }}>{profile.reminderEnabled ? 'WŁĄCZONE' : 'WYŁĄCZONE'}</Text>
        </Pressable>
        <Label style={{ marginTop: 14 }}>DZIEŃ</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {days.map((day, index) => <Pressable key={day} onPress={() => { setProfile((current) => ({ ...current, reminderDay: index })); setSaved(false); }} style={{ paddingVertical: 9, paddingHorizontal: 10, borderRadius: 7, backgroundColor: profile.reminderDay === index ? '#3A2022' : C.panel2, borderWidth: 1, borderColor: profile.reminderDay === index ? C.red : C.line }}><Text style={{ color: C.text, fontSize: 10, fontWeight: '800' }}>{day}</Text></Pressable>)}
        </View>
        <Label style={{ marginTop: 14 }}>GODZINA (HH:MM)</Label>
        <TextInput value={profile.reminderTime} onChangeText={(value) => { setProfile((current) => ({ ...current, reminderTime: value.slice(0, 5) })); setSaved(false); }} placeholder="18:00" placeholderTextColor="#687078" keyboardType="numbers-and-punctuation" maxLength={5} style={field} />
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 7 }}>Powiadomienie wymaga zgody systemu. Na symulatorach lub w środowisku web może nie działać tak jak na fizycznym telefonie.</Text>
        <Pressable onPress={persist} style={{ backgroundColor: C.red, borderRadius: 9, padding: 14, alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>ZAPISZ USTAWIENIA</Text>
        </Pressable>
        {saved ? <Text style={{ color: C.green, fontSize: 10, marginTop: 9, textAlign: 'center' }}>USTAWIENIA ZAPISANE</Text> : null}
      </Panel>

      <Eyebrow> / BACKUP & RESTORE</Eyebrow>
      <Panel style={{ marginTop: 10 }}>
        <Text style={{ color: C.text, fontWeight: '900' }}>KOPIA ZAPASOWA JSON</Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 7 }}>Eksport tworzy prawdziwy plik .json z profilem i całą historią. Możesz go zachować poza aplikacją.</Text>
        <Pressable disabled={busy} onPress={doExport} style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.red, borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 13, opacity: busy ? 0.5 : 1 }}>
          <Text style={{ color: C.text, fontWeight: '900' }}>{busy ? 'PRZETWARZANIE…' : '⇩ EKSPORTUJ PLIK JSON'}</Text>
        </Pressable>
        <Label style={{ marginTop: 18 }}>IMPORT KOPII JSON</Label>
        <Pressable disabled={busy} onPress={pickBackup} style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.red, borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 10 }}>
          <Text style={{ color: C.text, fontWeight: '900' }}>WYBIERZ PLIK JSON Z TELEFONU</Text>
        </Pressable>
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 5 }}>Otwórz wcześniej zapisany plik JSON, skopiuj jego zawartość i wklej poniżej.</Text>
        <TextInput value={backupText} onChangeText={setBackupText} multiline placeholder="Wklej zawartość kopii JSON…" placeholderTextColor="#687078" style={[field, { minHeight: 110, textAlignVertical: 'top', fontFamily: 'monospace' }]} />
        <Pressable disabled={busy} onPress={doRestore} style={{ backgroundColor: C.panel2, borderWidth: 1, borderColor: C.line, borderRadius: 9, padding: 13, alignItems: 'center', marginTop: 10, opacity: busy ? 0.5 : 1 }}>
          <Text style={{ color: C.text, fontWeight: '900' }}>PRZYWRÓĆ Z WKLEJONEJ KOPII</Text>
        </Pressable>
      </Panel>

      <Eyebrow> / STATYSTYKI KONTA</Eyebrow>
      <Panel style={{ marginTop: 10 }}>
        <Label>ZAPISANE SESJE</Label>
        <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 6 }}>{workoutCount}</Text>
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 7 }}>Profil i dziennik są przechowywane lokalnie na tym urządzeniu.</Text>
      </Panel>
    </ScrollView>
  );
}
