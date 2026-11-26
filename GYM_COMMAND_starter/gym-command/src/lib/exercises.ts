import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExerciseCategory = 'KLATKA' | 'PLECY' | 'BARKI' | 'RAMIONA' | 'CORE' | 'NOGI' | 'WŁASNE';

export type ExerciseInfo = {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: string;
  description: string;
  setup: string[];
  cues: string[];
  custom?: boolean;
};

export const EXERCISE_KEY = 'gym-command-custom-exercises-v1';

export const BUILT_IN_EXERCISES: ExerciseInfo[] = [
  { id: 'chest-press', name: 'Chest Press Machine', category: 'KLATKA', equipment: 'Maszyna', description: 'Wyciskanie na maszynie z podparciem pleców.', setup: ['Ustaw siedzisko tak, aby uchwyty znajdowały się mniej więcej na wysokości środka klatki.', 'Oprzyj plecy i stopy stabilnie o podłoże.', 'Dobierz ustawienie zgodnie z instrukcją konkretnej maszyny.'], cues: ['Prowadź ruch płynnie.', 'Nie blokuj gwałtownie łokci.', 'Przerwij, jeśli pojawi się ból.'] },
  { id: 'pec-deck', name: 'Pec Deck', category: 'KLATKA', equipment: 'Maszyna', description: 'Przywodzenie ramion na maszynie do rozpiętek.', setup: ['Ustaw siedzisko, aby ramiona maszyny były na wysokości klatki.', 'Oprzyj plecy o oparcie.', 'Ustaw zakres ruchu komfortowo, bez wymuszania rozciągnięcia.'], cues: ['Utrzymuj spokojne tempo.', 'Nie odbijaj ciężaru.', 'Nie zwiększaj zakresu kosztem komfortu barków.'] },
  { id: 'seated-row', name: 'Seated Cable Row', category: 'PLECY', equipment: 'Wyciąg', description: 'Przyciąganie uchwytu wyciągu w pozycji siedzącej.', setup: ['Usiądź stabilnie i ustaw podpórki stóp.', 'Wybierz uchwyt, który pozwala utrzymać nadgarstki w wygodnej pozycji.', 'Przed rozpoczęciem sprawdź mocowanie uchwytu.'], cues: ['Utrzymuj tułów stabilnie.', 'Prowadź łokcie w kontrolowany sposób.', 'Nie odchylaj się mocno, aby poruszyć ciężar.'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'PLECY', equipment: 'Wyciąg', description: 'Ściąganie drążka wyciągu górnego.', setup: ['Dopasuj blokadę ud tak, aby stabilnie trzymała nogi.', 'Usiądź z tułowiem ustawionym wygodnie.', 'Chwyć drążek na szerokość pozwalającą na komfortowy ruch.'], cues: ['Ściągaj drążek przed sobą, w kierunku górnej klatki.', 'Nie ciągnij drążka za kark.', 'Unikaj bujania tułowiem.'] },
  { id: 'chest-supported-row', name: 'Chest-Supported Row', category: 'PLECY', equipment: 'Maszyna', description: 'Wiosłowanie z podparciem klatki piersiowej.', setup: ['Ustaw siedzisko i poduszkę tak, aby klatka wygodnie opierała się o podporę.', 'Dopasuj uchwyty do długości ramion.', 'Sprawdź, czy maszyna porusza się swobodnie.'], cues: ['Zachowuj kontakt klatki z podparciem.', 'Nie szarp uchwytami.', 'Wykonuj ruch w bezbolesnym zakresie.'] },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', category: 'BARKI', equipment: 'Maszyna', description: 'Odwrotne rozpiętki na maszynie.', setup: ['Ustaw siedzisko tak, aby uchwyty były na wysokości barków.', 'Ustaw klatkę przy oparciu, jeśli konstrukcja tego wymaga.', 'Dobierz zakres bez nadmiernego cofania ramion.'], cues: ['Utrzymuj lekko ugięte łokcie.', 'Nie unoś barków do uszu.', 'Kontroluj powrót uchwytów.'] },
  { id: 'shoulder-press', name: 'Machine Shoulder Press', category: 'BARKI', equipment: 'Maszyna', description: 'Wyciskanie nad głowę na maszynie.', setup: ['Ustaw siedzisko tak, aby uchwyty startowały w wygodnej pozycji przy barkach.', 'Oprzyj plecy o oparcie.', 'Sprawdź, czy zakres ruchu nie wymusza bólu lub nadmiernego wygięcia pleców.'], cues: ['Utrzymuj plecy przy oparciu.', 'Wyciskaj płynnie.', 'Nie wymuszaj pełnego zakresu.'] },
  { id: 'lateral-raise', name: 'Lateral Raise Machine', category: 'BARKI', equipment: 'Maszyna', description: 'Unoszenie ramion bokiem na maszynie.', setup: ['Dopasuj wysokość siedziska do osi obrotu maszyny.', 'Ustaw poduszki na ramionach zgodnie z instrukcją sprzętu.', 'Zacznij od lekkiego obciążenia, aby poznać tor ruchu.'], cues: ['Nie rozpędzaj ramion.', 'Nie unoś barków do uszu.', 'Zatrzymaj ruch, jeśli pojawi się dyskomfort.'] },
  { id: 'biceps-curl', name: 'Biceps Curl Machine', category: 'RAMIONA', equipment: 'Maszyna', description: 'Uginanie ramion na maszynie bicepsowej.', setup: ['Ustaw siedzisko tak, aby poduszka podpierała ramiona.', 'Dopasuj oś obrotu do okolicy łokcia, jeśli maszyna ma taką regulację.', 'Chwyć uchwyty bez nadmiernego zginania nadgarstków.'], cues: ['Nie odrywaj ramion od poduszki.', 'Unikaj szarpania.', 'Kontroluj opuszczanie.'] },
  { id: 'triceps-pushdown', name: 'Cable Triceps Pushdown', category: 'RAMIONA', equipment: 'Wyciąg', description: 'Prostowanie ramion na wyciągu górnym.', setup: ['Zamocuj odpowiedni uchwyt i sprawdź karabińczyk.', 'Stań stabilnie blisko wyciągu.', 'Ustaw łokcie w wygodnej pozycji przy tułowiu.'], cues: ['Poruszaj głównie przedramionami.', 'Nie kołysz tułowiem.', 'Nie blokuj łokci z impetem.'] },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'CORE', equipment: 'Wyciąg', description: 'Zginanie tułowia z linką wyciągu.', setup: ['Użyj liny i sprawdź jej mocowanie.', 'Uklęknij na podkładce tylko jeśli pozycja jest dla Ciebie komfortowa.', 'Ustaw wyciąg wysoko zgodnie z instrukcją.'], cues: ['Wykonuj kontrolowany ruch tułowia.', 'Nie ciągnij ciężaru samymi rękami.', 'Pomiń ćwiczenie, jeśli pozycja klęcząca jest niewskazana.'] },
  { id: 'leg-extension', name: 'Leg Extension', category: 'NOGI', equipment: 'Maszyna', description: 'Prostowanie nóg na maszynie siedząc.', setup: ['Dopasuj oś obrotu maszyny do okolicy stawu kolanowego.', 'Ustaw poduszkę nad dolną częścią goleni, zgodnie z instrukcją sprzętu.', 'Nie rozpoczynaj ćwiczenia bez zgody lekarza lub fizjoterapeuty po urazie kolana.'], cues: ['To wpis informacyjny, nie zalecenie rehabilitacyjne.', 'Nie testuj zakresu ani obciążenia na własną rękę po urazie.', 'W razie bólu lub niestabilności przerwij.'] },
];

export async function getCustomExercises(): Promise<ExerciseInfo[]> {
  try {
    const raw = await AsyncStorage.getItem(EXERCISE_KEY);
    return raw ? JSON.parse(raw) as ExerciseInfo[] : [];
  } catch {
    return [];
  }
}

export async function saveCustomExercise(exercise: ExerciseInfo): Promise<void> {
  const current = await getCustomExercises();
  await AsyncStorage.setItem(EXERCISE_KEY, JSON.stringify([exercise, ...current]));
}
