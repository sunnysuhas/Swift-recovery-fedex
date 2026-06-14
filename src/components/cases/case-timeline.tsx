'use client';

import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';
import { ShieldCheck, MessageSquare, AlertOctagon, User, Clock, FileCheck } from 'lucide-react';

type CaseTimelineProps = {
  logs: AuditLog[];
  caseHistory: string;
};

export function CaseTimeline({ logs, caseHistory }: CaseTimelineProps) {
  let historyItems: Array<{
    id: string;
    timestamp: Date;
    user: string;
    action: string;
    details: string;
  }> = [];

  // Robust parsing of caseHistory (supports JSON arrays and plain strings)
  if (caseHistory) {
    const trimmed = caseHistory.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          historyItems = parsed.map((item: any, idx: number) => {
            const rawDate = item.date || item.timestamp;
            let dateObj = new Date();
            if (rawDate) {
              dateObj = new Date(rawDate);
              if (isNaN(dateObj.getTime())) {
                dateObj = new Date();
              }
            }
            return {
              id: `hist-json-${idx}-${dateObj.getTime()}`,
              timestamp: dateObj,
              user: item.user || 'Agency / Automated',
              action: item.action || 'Timeline Event',
              details: item.details || '',
            };
          });
        }
      } catch (e) {
        console.warn('Failed to parse case history JSON logs, falling back to string split.');
      }
    }

    // Fallback if not JSON or JSON parsing failed
    if (historyItems.length === 0) {
      historyItems = trimmed
        .split('. ')
        .filter(Boolean)
        .map((entry, idx) => {
          const parts = entry.split(': ');
          const rawDate = parts[0] || '';
          const action = parts.slice(1).join(': ') || 'System Log';
          
          let dateObj = new Date();
          if (rawDate) {
            const cleanDate = rawDate.includes(',') ? rawDate : `${rawDate} 2024`;
            const parsedD = new Date(cleanDate);
            if (!isNaN(parsedD.getTime())) {
              dateObj = parsedD;
            }
          }

          return {
            id: `hist-str-${idx}-${dateObj.getTime()}`,
            timestamp: dateObj,
            user: 'System/DCA',
            action,
            details: '',
          };
        });
    }
  }

  // Combine local audit logs andParsed history items
  const auditLogsParsed = logs.map(l => {
    let dateObj = new Date(l.timestamp);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    return {
      id: l.id,
      timestamp: dateObj,
      user: l.user || l.userId || 'System',
      action: l.action,
      details: l.details || '',
    };
  });

  const allItems = [...auditLogsParsed, ...historyItems].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const getTimelineIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('rpa') || act.includes('escalat')) return <AlertOctagon className="h-3 w-3 text-red-500" />;
    if (act.includes('payment') || act.includes('paid')) return <ShieldCheck className="h-3 w-3 text-emerald-500" />;
    if (act.includes('communication') || act.includes('notified') || act.includes('letter')) return <MessageSquare className="h-3 w-3 text-blue-500" />;
    if (act.includes('created')) return <FileCheck className="h-3 w-3 text-muted-foreground" />;
    return <Clock className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="relative pl-6">
      {/* Central line */}
      <div className="absolute left-0 top-0 h-full w-px bg-border/40 -translate-x-1/2 ml-3"></div>

      <ul className="space-y-6">
        {allItems.map((log) => (
          <li key={log.id} className="relative flex items-start group">
            {/* Timeline node */}
            <div className="absolute left-0 top-1 h-6 w-6 rounded-full border border-border/40 bg-card flex items-center justify-center -translate-x-1/2 shadow-sm">
              {getTimelineIcon(log.action)}
            </div>

            <div className="pl-6 flex-1">
              <div className="flex justify-between items-center gap-4">
                <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {log.action}
                </p>
                <time className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                  {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                </time>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Operated by: <span className="font-medium text-foreground">{log.user}</span></p>
              {log.details && (
                <p className="text-[11px] text-muted-foreground bg-muted/20 border border-border/20 rounded p-2 mt-1.5 leading-normal">
                  {log.details}
                </p>
              )}
            </div>
          </li>
        ))}
        {allItems.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No history logs found on this case.
          </div>
        )}
      </ul>
    </div>
  );
}
