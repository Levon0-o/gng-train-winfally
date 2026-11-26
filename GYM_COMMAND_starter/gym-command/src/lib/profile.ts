import AsyncStorage from '@react-native-async-storage/async-storage';

export type AccentTheme = 'red' | 'blue' | 'green' | 'amber';
export type UserProfile = {
  displayName: string;
  weeklyGoal: number;
  accentTheme: AccentTheme;
  reminderEnabled: boolean;
  reminderDay: number;
  reminderTime: string;
};

const KEY = 'gym-command-profile-v1';
export const DEFAULT_PROFILE: UserProfile = {
  displayName: 'ATHLETE',
  weeklyGoal: 3,
  accentTheme: 'red',
  reminderEnabled: false,
  reminderDay: 1,
  reminderTime: '18:00',
};

const validTheme = (value: unknown): value is AccentTheme =>
  value === 'red' || value === 'blue' || value === 'green' || value === 'amber';
const validTime = (value: unknown): value is string =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export async function getProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : DEFAULT_PROFILE.displayName,
      weeklyGoal: Number.isInteger(parsed.weeklyGoal) && (parsed.weeklyGoal ?? 0) >= 1 && (parsed.weeklyGoal ?? 0) <= 7
        ? parsed.weeklyGoal as number : DEFAULT_PROFILE.weeklyGoal,
      accentTheme: validTheme(parsed.accentTheme) ? parsed.accentTheme : 'red',
      reminderEnabled: parsed.reminderEnabled === true,
      reminderDay: Number.isInteger(parsed.reminderDay) && (parsed.reminderDay ?? 0) >= 0 && (parsed.reminderDay ?? 0) <= 6
        ? parsed.reminderDay as number : 1,
      reminderTime: validTime(parsed.reminderTime) ? parsed.reminderTime : '18:00',
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const safeProfile: UserProfile = {
    displayName: profile.displayName.trim().slice(0, 24) || DEFAULT_PROFILE.displayName,
    weeklyGoal: Math.min(7, Math.max(1, Math.round(profile.weeklyGoal))),
    accentTheme: validTheme(profile.accentTheme) ? profile.accentTheme : 'red',
    reminderEnabled: profile.reminderEnabled === true,
    reminderDay: Math.min(6, Math.max(0, Math.round(profile.reminderDay))),
    reminderTime: validTime(profile.reminderTime) ? profile.reminderTime : '18:00',
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(safeProfile));
}
