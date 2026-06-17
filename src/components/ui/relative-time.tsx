import { formatDateTime, formatRelative, type DateInput } from '@/lib/date';

export interface RelativeTimeProps {
  value: DateInput;
}

export function RelativeTime({ value }: RelativeTimeProps) {
  const label = formatRelative(value);
  const title = formatDateTime(value);

  return <time title={title}>{label}</time>;
}
