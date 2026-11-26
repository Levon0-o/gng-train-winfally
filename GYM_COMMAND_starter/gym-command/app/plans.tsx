import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { C, Eyebrow, Heading, Panel, Label } from '../src/components/UI';
import { WORKOUT_TEMPLATES } from '../src/lib/templates';

export default function WorkoutPlans() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 58, paddingBottom: 36 }}>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: C.red, fontWeight: '900', letterSpacing: 1 }}>← WRÓĆ</Text>
      </Pressable>
      <Eyebrow>SESSION LIBRARY / 04</Eyebrow>
      <Heading>PLANY TRENINGOWE</Heading>
      <Text style={{ color: C.muted, marginTop: 7, marginBottom: 20, lineHeight: 19 }}>
        Wybierz szablon, a ćwiczenia zostaną dodane do dziennika. Każdą serię zapisujesz samodzielnie.
      </Text>
      {WORKOUT_TEMPLATES.map((template, index) => (
        <Panel key={template.id} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>PRESET 0{index + 1} · {template.category}</Label>
            <Label>{template.duration}</Label>
          </View>
          <Text style={{ color: C.text, fontSize: 19, fontWeight: '900', marginTop: 9 }}>{template.title}</Text>
          <Text style={{ color: C.muted, marginTop: 6, lineHeight: 18 }}>{template.description}</Text>
          <View style={{ marginTop: 14, gap: 8 }}>
            {template.exercises.map((exercise, exerciseIndex) => (
              <View key={exercise} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: C.red, fontWeight: '900', width: 20 }}>0{exerciseIndex + 1}</Text>
                <Text style={{ color: C.steel, fontSize: 13, fontWeight: '700' }}>{exercise}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/log', params: { templateId: template.id } })}
            style={{ backgroundColor: C.red, borderRadius: 9, padding: 14, marginTop: 18, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>WYBIERZ TEN PLAN →</Text>
          </Pressable>
        </Panel>
      ))}
      <Text style={{ color: '#747C83', fontSize: 11, lineHeight: 17, marginTop: 4 }}>
        To szablony do rejestrowania treningów, nie zalecenia medyczne ani plan rehabilitacji. Dobór ćwiczeń i powrót do treningu po urazie skonsultuj z lekarzem lub fizjoterapeutą.
      </Text>
    </ScrollView>
  );
}
