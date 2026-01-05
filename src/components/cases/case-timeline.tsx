import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

type CaseTimelineProps = {
  logs: AuditLog[];
  caseHistory: string;
};

export function CaseTimeline({ logs, caseHistory }: CaseTimelineProps) {
  // A simple way to parse the case history string into timeline items
  const historyItems = caseHistory.split('. ').filter(Boolean).map(entry => {
    const [date, ...actionParts] = entry.split(': ');
    return {
      id: `hist-${date}`,
      // This is a hack, in a real app timestamps would be consistent
      timestamp: new Date(date.includes(',') ? date : `${date} 2024`),
      user: 'System/DCA',
      action: actionParts.join(': '),
      details: '',
    };
  });

  const allItems = [...logs.map(l => ({ ...l, timestamp: new Date(l.timestamp) })), ...historyItems]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>
      <ul className="space-y-8">
        {allItems.map((log, index) => (
          <li key={log.id} className="relative flex items-start">
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary -translate-x-1/2"></div>
            <div className="pl-4 flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">
                  {log.action}
                </p>
                <time className="text-xs text-muted-foreground">
                  {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">by {log.user}</p>
              {log.details && <p className="text-sm mt-1">{log.details}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
