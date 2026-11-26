import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getProfile, saveProfile, UserProfile } from './profile';
import { getWorkouts, replaceWorkouts, Workout } from './storage';

const FORMAT = 'gym-command-backup';
const VERSION = 1;

type BackupPayload = {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  profile: UserProfile;
  workouts: Workout[];
};

export async function exportBackup(): Promise<void> {
  const payload: BackupPayload = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    profile: await getProfile(),
    workouts: await getWorkouts(),
  };
  const directory = FileSystem.documentDirectory;
  if (!directory) throw new Error('Brak katalogu dokumentów aplikacji.');
  const uri = directory + 'gym-command-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!(await Sharing.isAvailableAsync())) throw new Error('Udostępnianie plików nie jest dostępne.');
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Eksport kopii GYM COMMAND',
    UTI: 'public.json',
  });
}

function isWorkout(value: unknown): value is Workout {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Workout>;
  return typeof item.id === 'string'
    && typeof item.date === 'string'
    && typeof item.title === 'string'
    && typeof item.notes === 'string'
    && Array.isArray(item.exercises)
    && item.exercises.every((exercise) => exercise
      && typeof exercise.id === 'string'
      && typeof exercise.name === 'string'
      && Number.isFinite(exercise.sets)
      && Number.isFinite(exercise.reps)
      && Number.isFinite(exercise.weight));
}

export async function restoreBackup(raw: string): Promise<number> {
  const parsed = JSON.parse(raw) as Partial<BackupPayload>;
  if (parsed.format !== FORMAT || parsed.version !== VERSION || !Array.isArray(parsed.workouts) || !parsed.workouts.every(isWorkout)) {
    throw new Error('Plik nie jest prawidłową kopią GYM COMMAND w obsługiwanym formacie.');
  }
  const profile = parsed.profile;
  if (!profile || typeof profile.displayName !== 'string'
    || !Number.isInteger(profile.weeklyGoal)
    || !['red', 'blue', 'green', 'amber'].includes(profile.accentTheme)) {
    throw new Error('Kopia zawiera nieprawidłowe dane profilu.');
  }
  await replaceWorkouts(parsed.workouts);
  await saveProfile(profile);
  return parsed.workouts.length;
}
