const colorClasses: Record<string, string> = {
  green:  'text-green-700 bg-green-50 border border-green-200',
  amber:  'text-amber-700 bg-amber-50 border border-amber-200',
  red:    'text-red-700 bg-red-50 border border-red-200',
  blue:   'text-blue-700 bg-blue-50 border border-blue-200',
  purple: 'text-purple-700 bg-purple-50 border border-purple-200',
};

export function getDifficultyColor(color: string): string {
  return colorClasses[color] ?? 'text-on-surface-variant bg-surface-container border border-outline-variant';
}
