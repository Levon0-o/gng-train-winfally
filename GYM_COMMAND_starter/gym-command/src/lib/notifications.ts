import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserProfile } from './profile';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function syncWorkoutReminder(profile: UserProfile): Promise<string> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!profile.reminderEnabled) return 'Przypomnienia są wyłączone.';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('workout-reminders', {
        name: 'Przypomnienia treningowe',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
      });
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      return 'Brak zgody na powiadomienia. Włącz je w ustawieniach urządzenia.';
    }

    const [hourText, minuteText] = profile.reminderTime.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      return 'Nieprawidłowa godzina przypomnienia.';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'GYM COMMAND',
        body: 'Masz zaplanowaną aktywność. Sprawdź plan i dopasuj go do regeneracji.',
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: profile.reminderDay + 1,
        hour,
        minute,
        ...(Platform.OS === 'android' ? { channelId: 'workout-reminders' } : {}),
      },
    });
    return 'Cotygodniowe powiadomienie systemowe zostało ustawione.';
  } catch {
    return 'Nie udało się skonfigurować powiadomienia na tym urządzeniu.';
  }
}
