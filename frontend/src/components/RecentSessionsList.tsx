import { useState } from 'react';

export default function RecentSessionsList({ sessions, navigate }: { sessions: any[]; navigate: any }) {
  const [showAll, setShowAll] = useState(false);
  const visibleSessions = showAll ? sessions : sessions.slice(0, 3);

  return (
    <div className="space-y-3">
      {visibleSessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => session.status === 'completed' 
            ? navigate(`/results/${session.id}`)
            : navigate(`/interview/${session.id}`)
          }
        >
          <div>
            <div className="font-medium capitalize">
              {session.interviewType} Interview
            </div>
            <div className="text-sm text-muted-foreground">
              {session.startedAt.toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            {session.status === 'completed' ? (
              <div className="text-lg font-bold text-accent">
                {session.finalScore}%
              </div>
            ) : (
              <div className="text-sm text-warning">In Progress</div>
            )}
          </div>
        </div>
      ))}
      {sessions.length > 3 && !showAll && (
        <button
          className="block mx-auto mt-2 text-primary underline text-sm hover:text-primary/80"
          onClick={() => setShowAll(true)}
        >
          Read more
        </button>
      )}
      {sessions.length > 3 && showAll && (
        <button
          className="block mx-auto mt-2 text-primary underline text-sm hover:text-primary/80"
          onClick={() => setShowAll(false)}
        >
          Show less
        </button>
      )}
    </div>
  );
}
