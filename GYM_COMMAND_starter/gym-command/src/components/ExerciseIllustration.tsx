import React from 'react';
import { Text, View } from 'react-native';
import { C } from './UI';

type Props = { category: string; equipment: string };

const accents: Record<string, string> = {
  KLATKA: '#E34B4B',
  PLECY: '#4C9AD6',
  BARKI: '#B18AE5',
  RAMIONA: '#D69A4C',
  CORE: '#67B99A',
  NOGI: '#A8B66A',
  WŁASNE: '#92999F',
};

const shortNames: Record<string, string> = {
  KLATKA: 'CH',
  PLECY: 'BK',
  BARKI: 'SH',
  RAMIONA: 'AR',
  CORE: 'CR',
  NOGI: 'LG',
  WŁASNE: 'EX',
};

export default function ExerciseIllustration({ category, equipment }: Props) {
  const accent = accents[category] ?? C.red;
  const isCable = equipment.toLocaleLowerCase().includes('wyciąg');
  const isMachine = equipment.toLocaleLowerCase().includes('maszyna');

  return (
    <View style={{ height: 94, borderRadius: 9, backgroundColor: '#111519', overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 15, marginBottom: 13 }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: accent }} />
      <View style={{ position: 'absolute', right: 12, top: 10, borderWidth: 1, borderColor: '#343A40', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 }}>
        <Text style={{ color: accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>{shortNames[category] ?? 'EX'}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <View style={{ width: 88, height: 66, justifyContent: 'center', alignItems: 'center' }}>
          {isCable ? (
            <>
              <View style={{ position: 'absolute', left: 12, top: 4, width: 5, height: 56, backgroundColor: '#59636B', borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 14, top: 8, width: 53, height: 2, backgroundColor: '#59636B', transform: [{ rotate: '18deg' }] }} />
              <View style={{ position: 'absolute', left: 58, top: 20, width: 2, height: 28, backgroundColor: accent }} />
              <View style={{ position: 'absolute', left: 52, top: 45, width: 14, height: 4, backgroundColor: accent, borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 6, bottom: 2, width: 30, height: 4, backgroundColor: '#59636B', borderRadius: 3 }} />
            </>
          ) : isMachine ? (
            <>
              <View style={{ position: 'absolute', left: 10, bottom: 5, width: 68, height: 5, backgroundColor: '#59636B', borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 18, bottom: 10, width: 5, height: 43, backgroundColor: '#59636B', borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 18, top: 7, width: 43, height: 5, backgroundColor: '#59636B', borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 43, top: 12, width: 9, height: 30, backgroundColor: accent, borderRadius: 4, transform: [{ rotate: '-18deg' }] }} />
              <View style={{ position: 'absolute', left: 31, bottom: 14, width: 30, height: 6, backgroundColor: '#87919A', borderRadius: 3 }} />
            </>
          ) : (
            <>
              <View style={{ width: 48, height: 5, backgroundColor: '#AAB2B9', borderRadius: 4 }} />
              <View style={{ position: 'absolute', left: 8, top: 25, width: 9, height: 16, backgroundColor: accent, borderRadius: 3 }} />
              <View style={{ position: 'absolute', right: 8, top: 25, width: 9, height: 16, backgroundColor: accent, borderRadius: 3 }} />
              <View style={{ position: 'absolute', left: 0, top: 30, width: 8, height: 7, backgroundColor: '#59636B', borderRadius: 2 }} />
              <View style={{ position: 'absolute', right: 0, top: 30, width: 8, height: 7, backgroundColor: '#59636B', borderRadius: 2 }} />
            </>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#E5E8EA', fontSize: 9, fontWeight: '900', letterSpacing: 1 }}>MOVEMENT PROFILE</Text>
          <Text style={{ color: accent, fontSize: 12, fontWeight: '900', marginTop: 5 }}>{category}</Text>
          <Text style={{ color: C.muted, fontSize: 9, marginTop: 3 }}>{equipment.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}
