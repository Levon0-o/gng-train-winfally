import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  displayName: string;
  weeklyGoal: number;
};

const KEY = 'gym-command-profile-v1';
const DEFAULT_PROFILE: UserProfile = { displayName: 'ATHLETE', weeklyGoal: 3 };

export async function getProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : DEFAULT_PROFILE.displayName,
      weeklyGoal: Number.isInteger(parsed.weeklyGoal) && (parsed.weeklyGoal ?? 0) >= 1 && (parsed.weeklyGoal ?? 0) <= 7
        ? parsed.weeklyGoal as number
        : DEFAULT_PROFILE.weeklyGoal,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const safeProfile: UserProfile = {
    displayName: profile.displayName.trim().slice(0, 24) || DEFAULT_PROFILE.displayName,
    weeklyGoal: Math.min(7, Math.max(1, Math.round(profile.weeklyGoal))),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(safeProfile));
}
