/**
 * Progress Dashboard Component
 * Shows user's learning progress, XP, achievements, and stats
 */
import React, { useEffect, useState } from 'react';
import { 
  UserProgress, 
  getProgress, 
  getXpForNextLevel, 
  getCompletionStats,
  getAchievementDetails 
} from '../lib/progress';

interface ProgressDashboardProps {
  compact?: boolean;
}

export function ProgressDashboard({ compact = false }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getCompletionStats> | null>(null);

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
    setStats(getCompletionStats());
  }, []);

  if (!progress || !stats) {
    return <div className="p-4 text-center text-bauhaus-dark-gray">Loading...</div>;
  }

  const xpInfo = getXpForNextLevel(progress.xp);
  const xpPercent = Math.round((xpInfo.current / xpInfo.required) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 border-2 border-bauhaus-black bg-bauhaus-white">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-bauhaus-blue flex items-center justify-center text-white font-bold">
            {progress.level}
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-bauhaus-dark-gray">Level</div>
            <div className="text-sm font-semibold">{progress.xp} XP</div>
          </div>
        </div>
        
        {/* XP bar */}
        <div className="flex-1">
          <div className="h-2 bg-bauhaus-gray">
            <div 
              className="h-full bg-bauhaus-yellow transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="text-xs text-bauhaus-dark-gray mt-1">
            {xpInfo.current}/{xpInfo.required} to level {progress.level + 1}
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-lg font-bold">{stats.sectionsCompleted}</div>
            <div className="text-xs text-bauhaus-dark-gray">Sections</div>
          </div>
          <div>
            <div className="text-lg font-bold">{stats.conceptsMastered}</div>
            <div className="text-xs text-bauhaus-dark-gray">Mastered</div>
          </div>
          <div>
            <div className="text-lg font-bold">{progress.currentStreak}</div>
            <div className="text-xs text-bauhaus-dark-gray">Streak</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-bauhaus-black bg-bauhaus-white">
      <div className="p-3 border-b-2 border-bauhaus-black flex items-center gap-2">
        <div className="w-3 h-3 bg-bauhaus-blue"></div>
        <span className="font-semibold text-sm uppercase tracking-wider">Your Progress</span>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Level and XP */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-bauhaus-blue flex items-center justify-center text-white text-2xl font-bold">
            {progress.level}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Level {progress.level}</span>
              <span className="text-sm font-mono">{progress.xp} XP</span>
            </div>
            <div className="h-3 bg-bauhaus-gray border border-bauhaus-black">
              <div 
                className="h-full bg-bauhaus-yellow transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="text-xs text-bauhaus-dark-gray mt-1">
              {xpInfo.current}/{xpInfo.required} XP to level {progress.level + 1}
            </div>
          </div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          <StatBox 
            value={stats.sectionsCompleted} 
            label="Sections" 
            total={stats.totalSections}
            color="red"
          />
          <StatBox 
            value={stats.conceptsMastered} 
            label="Mastered" 
            color="blue"
          />
          <StatBox 
            value={progress.currentStreak} 
            label="Day Streak" 
            color="yellow"
          />
          <StatBox 
            value={formatTime(progress.totalTimeSpent)} 
            label="Time Spent" 
            color="black"
          />
        </div>
        
        {/* Completion bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold">Course Completion</span>
            <span className="text-sm font-mono">{stats.percentComplete}%</span>
          </div>
          <div className="h-4 bg-bauhaus-gray border border-bauhaus-black flex">
            <div 
              className="h-full bg-bauhaus-red transition-all"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <div className="text-sm font-semibold mb-2">Achievements</div>
          <div className="flex flex-wrap gap-2">
            {progress.achievements.length === 0 ? (
              <span className="text-sm text-bauhaus-dark-gray">
                Complete sections to earn achievements
              </span>
            ) : (
              progress.achievements.map(id => {
                const achievement = getAchievementDetails(id);
                return (
                  <div 
                    key={id}
                    className="w-10 h-10 bg-bauhaus-yellow border-2 border-bauhaus-black flex items-center justify-center font-bold"
                    title={`${achievement.name}: ${achievement.description}`}
                  >
                    {achievement.icon}
                  </div>
                );
              })
            )}
            
            {/* Locked achievements */}
            {Array.from({ length: Math.max(0, 6 - progress.achievements.length) }).map((_, i) => (
              <div 
                key={`locked-${i}`}
                className="w-10 h-10 bg-bauhaus-gray border-2 border-bauhaus-gray flex items-center justify-center text-bauhaus-dark-gray"
              >
                ?
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent activity */}
        <div>
          <div className="text-sm font-semibold mb-2">Recent Activity</div>
          <div className="text-xs text-bauhaus-dark-gray">
            Started: {new Date(progress.startedAt).toLocaleDateString()}
            <br />
            Last active: {new Date(progress.lastActive).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ 
  value, 
  label, 
  total, 
  color 
}: { 
  value: number | string; 
  label: string; 
  total?: number;
  color: 'red' | 'blue' | 'yellow' | 'black';
}) {
  const bgColors = {
    red: 'bg-bauhaus-red',
    blue: 'bg-bauhaus-blue',
    yellow: 'bg-bauhaus-yellow',
    black: 'bg-bauhaus-black'
  };
  
  const textColors = {
    red: 'text-white',
    blue: 'text-white',
    yellow: 'text-bauhaus-black',
    black: 'text-white'
  };
  
  return (
    <div className={`p-3 ${bgColors[color]} ${textColors[color]} text-center`}>
      <div className="text-xl font-bold">
        {value}
        {total && <span className="text-sm opacity-70">/{total}</span>}
      </div>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

export default ProgressDashboard;
