import type { TrackingEvent } from './thailand-post';

export function postalEventTime(date: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/.exec(date);
  if (!match) return 0;
  const year = Number(match[3]) > 2400 ? Number(match[3]) - 543 : Number(match[3]);
  return Date.UTC(year, Number(match[2]) - 1, Number(match[1]), Number(match[4]) - 7, Number(match[5]), Number(match[6] || 0));
}
export function postalUpdate(events: TrackingEvent[]) {
  const latest = [...events].sort((a, b) => postalEventTime(b.date) - postalEventTime(a.date))[0];
  if (!latest) return null;
  // 101 is preload, not physical acceptance; 104 is a cancelled acceptance.
  const accepted = ['102','103','201','202','203','204','205','206','208','209','210','211','212','213','214','215','216','217','218','219','220','301','302','303','304','401','402','501'].includes(latest.status);
  return { event: latest, fulfillment: latest.status === '501' ? 'completed' : accepted ? 'shipped' : null };
}
