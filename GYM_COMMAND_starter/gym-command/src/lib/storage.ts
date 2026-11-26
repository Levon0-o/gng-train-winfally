import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export type Workout = {
  id: string;
  date: string;
  title: string;
  notes: string;
  exercises: ExerciseEntry[];
};

const KEY = 'gym-command-workouts-v1';

export async function getWorkouts(): Promise<Workout[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Workout[] : [];
  } catch {
    return [];
  }
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const current = await getWorkouts();
  await AsyncStorage.setItem(KEY, JSON.stringify([workout, ...current]));
}
