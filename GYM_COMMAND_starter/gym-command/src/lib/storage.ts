import AsyncStorage from '@react-native-async-storage/async-storage';

export type SetEntry = {
  id: string;
  reps: number;
  weight: number;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  setDetails?: SetEntry[];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Workout[];
    return parsed.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        setDetails: exercise.setDetails?.length
          ? exercise.setDetails
          : Array.from({ length: exercise.sets || 0 }, (_, index) => ({
              id: `legacy-${exercise.id}-${index}`,
              reps: exercise.reps || 0,
              weight: exercise.weight || 0,
            })),
      })),
    }));
  } catch {
    return [];
  }
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const current = await getWorkouts();
  await AsyncStorage.setItem(KEY, JSON.stringify([workout, ...current]));
}

export async function updateWorkout(updated: Workout): Promise<void> {
  const current = await getWorkouts();
  const next = current.map((workout) => workout.id === updated.id ? updated : workout);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function deleteWorkout(id: string): Promise<void> {
  const current = await getWorkouts();
  await AsyncStorage.setItem(KEY, JSON.stringify(current.filter((workout) => workout.id !== id)));
}
