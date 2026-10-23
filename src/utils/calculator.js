import { formatDuration } from './youtubeApi';

/**
 * Calculates study pacing, required daily rate, deadline details, and track status.
 */
export function calculatePacing({ totalVideos, watchedVideos, totalSeconds, watchedSeconds, targetDays, createdAt }) {
  const remainingVideos = Math.max(0, totalVideos - watchedVideos);
  const remainingSeconds = Math.max(0, totalSeconds - watchedSeconds);
  const completionPercentage = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  // Calculate elapsed days since creation / start
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const now = new Date();
  const diffMs = now - createdDate;
  const elapsedDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  // Target Days calculation
  const totalTargetDays = targetDays || 30;
  const remainingDays = Math.max(1, totalTargetDays - elapsedDays + 1);

  // Daily requirements
  const dailyVideosNeeded = Math.ceil(remainingVideos / remainingDays);
  const dailySecondsNeeded = Math.round(remainingSeconds / remainingDays);

  // Expected progress by today according to the linear pacing
  const expectedWatchedByNow = Math.min(totalVideos, Math.round((elapsedDays / totalTargetDays) * totalVideos));
  const diffFromExpected = watchedVideos - expectedWatchedByNow;

  let paceStatus = 'on_track';
  let paceStatusText = 'On Track';
  let paceBadgeColor = 'emerald'; // green

  if (completionPercentage === 100) {
    paceStatus = 'completed';
    paceStatusText = 'Completed! 🎉';
    paceBadgeColor = 'cyan';
  } else if (diffFromExpected >= 2) {
    paceStatus = 'ahead';
    paceStatusText = `${diffFromExpected} videos ahead! 🚀`;
    paceBadgeColor = 'emerald';
  } else if (diffFromExpected <= -2) {
    paceStatus = 'behind';
    paceStatusText = `${Math.abs(diffFromExpected)} videos behind ⚠️`;
    paceBadgeColor = 'amber';
  }

  // Target deadline date
  const deadlineDate = new Date(createdDate);
  deadlineDate.setDate(deadlineDate.getDate() + totalTargetDays);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    remainingVideos,
    remainingSeconds,
    remainingDurationFormatted: formatDuration(remainingSeconds),
    completionPercentage,
    elapsedDays,
    totalTargetDays,
    remainingDays,
    dailyVideosNeeded,
    dailySecondsNeeded,
    dailyDurationFormatted: formatDuration(dailySecondsNeeded),
    expectedWatchedByNow,
    diffFromExpected,
    paceStatus,
    paceStatusText,
    paceBadgeColor,
    formattedDeadline,
  };
}

/**
 * Calculates current streak and study logs from watched video history
 */
export function calculateStreak(studyLogs) {
  if (!studyLogs || Object.keys(studyLogs).length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayMinutes: 0, todayVideos: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = studyLogs[todayStr] || { videos: 0, minutes: 0 };

  const dates = Object.keys(studyLogs)
    .filter((d) => (studyLogs[d].videos || 0) > 0)
    .sort()
    .reverse();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayMinutes: todayData.minutes, todayVideos: todayData.videos };
  }

  let currentStreak = 0;
  let checkDate = new Date();
  
  // If no activity today, check if yesterday had activity to continue streak
  const checkStr = checkDate.toISOString().split('T')[0];
  if (!studyLogs[checkStr] || studyLogs[checkStr].videos === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (studyLogs[dStr] && studyLogs[dStr].videos > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    todayMinutes: todayData.minutes || 0,
    todayVideos: todayData.videos || 0,
  };
}
