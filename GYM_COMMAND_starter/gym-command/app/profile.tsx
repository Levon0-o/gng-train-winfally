import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Label, Panel, setAccentTheme } from '../src/components/UI';
import { DEFAULT_PROFILE, getProfile, saveProfile, UserProfile } from '../src/lib/profile';
import { getWorkouts } from '../src/lib/storage';

const field = { backgroundColor: '#101214', borderWidth: 1, borderColor: C.line, borderRadius: 9, color: C.text, padding: 13, marginTop: 7 } as const;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);

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
      setSaved(true);
      Alert.alert('Profil zapisany', 'Ustawienia zapisano na tym urządzeniu.');
    } catch {
      Alert.alert('Błąd zapisu', 'Nie udało się zapisać profilu.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 35 }}>
      <Pressable onPress={() => router.back()}><Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text></Pressable>
      <Eyebrow>ATHLETE CONFIGURATION / 08</Eyebrow>
      <Heading>PROFIL</Heading>
      <Text style={{ color: C.muted, marginTop: 5, marginBottom: 17 }}>Podstawowe ustawienia lokalnego profilu.</Text>

      <Panel>
        <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#3A2022', borderWidth: 1, borderColor: C.red, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.red, fontSize: 22, fontWeight: '900' }}>{(profile.displayName.trim()[0] || 'A').toUpperCase()}</Text>
        </View>
        <Label style={{ marginTop: 17 }}>NAZWA WYŚWIETLANA</Label>
        <TextInput value={profile.displayName} onChangeText={(value) => { setProfile((current) => ({ ...current, displayName: value.slice(0, 24) })); setSaved(false); }} placeholder="Wpisz nazwę" placeholderTextColor="#687078" maxLength={24} style={field} />
        <Label style={{ marginTop: 18 }}>CEL TRENINGOWY NA TYDZIEŃ</Label>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }}>Ustaw orientacyjną liczbę sesji. Możesz ją zmienić w dowolnym momencie — nie jest to obowiązkowe minimum.</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = profile.weeklyGoal === value;
            return <Pressable key={value} onPress={() => { setProfile((current) => ({ ...current, weeklyGoal: value })); setSaved(false); }} style={{ flex: 1, paddingVertical: 13, borderRadius: 8, alignItems: 'center', backgroundColor: active ? '#3A2022' : C.panel2, borderWidth: 1, borderColor: active ? C.red : C.line }}><Text style={{ color: active ? '#FFFFFF' : C.steel, fontWeight: '900' }}>{value}</Text></Pressable>;
          })}
        </View>
        <Pressable onPress={persist} style={{ backgroundColor: C.red, borderRadius: 9, padding: 14, alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>ZAPISZ PROFIL</Text>
        </Pressable>
        {saved ? <Text style={{ color: C.green, fontSize: 10, marginTop: 9, textAlign: 'center' }}>USTAWIENIA ZAPISANE</Text> : null}
      </Panel>

      <Eyebrow> / STATYSTYKI KONTA</Eyebrow>
      <Panel style={{ marginTop: 10 }}>
        <Label>ZAPISANE SESJE</Label>
        <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', marginTop: 6 }}>{workoutCount}</Text>
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 7 }}>Dane treningowe pozostają lokalnie na tym urządzeniu.</Text>
      </Panel>
      <Panel style={{ marginTop: 10 }}>
        <Text style={{ color: C.text, fontWeight: '900' }}>PRYWATNOŚĆ I DANE</Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 7 }}>Profil i dziennik korzystają z lokalnego magazynu aplikacji. Ten ekran nie tworzy konta online ani kopii zapasowej w chmurze.</Text>
      </Panel>
    </ScrollView>
  );
}
