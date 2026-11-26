export type WorkoutTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  exercises: string[];
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'upper-a',
    title: 'UPPER BODY A',
    category: 'GÓRA CIAŁA',
    description: 'Podstawowy zestaw ćwiczeń na górne partie ciała.',
    duration: '40–55 MIN',
    exercises: ['Chest Press Machine', 'Seated Row', 'Lat Pulldown', 'Machine Shoulder Press', 'Biceps Curl Machine'],
  },
  {
    id: 'upper-b',
    title: 'UPPER BODY B',
    category: 'GÓRA CIAŁA',
    description: 'Drugi wariant treningu z naciskiem na plecy, klatkę i ramiona.',
    duration: '40–55 MIN',
    exercises: ['Incline Chest Press Machine', 'Chest-Supported Row', 'Lat Pulldown', 'Reverse Pec Deck', 'Seated Biceps Curl'],
  },
  {
    id: 'machines',
    title: 'MACHINE BASICS',
    category: 'MASZYNY',
    description: 'Prosty katalog maszyn do nauki obsługi i zapisywania postępów.',
    duration: '30–45 MIN',
    exercises: ['Chest Press Machine', 'Seated Row', 'Pec Deck', 'Lateral Raise Machine', 'Biceps Curl Machine'],
  },
];
