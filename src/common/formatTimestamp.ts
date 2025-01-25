export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return "";

  const timestampNum = Number(timestamp);
  if (isNaN(timestampNum)) return "";

  const now = Date.now();
  const date = new Date(
    timestampNum < 1e12 ? timestampNum * 1000 : timestampNum
  );

  if (date.toString() === "Invalid Date") return "";

  const milliseconds = now - date.getTime();
  const seconds = Math.floor(milliseconds / 1000);

  // Less than a minute
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  // Less than an hour
  if (minutes < 60) {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  // Less than a day
  if (hours < 24) {
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  // Less than a week
  if (days < 7) {
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  }

  const weeks = Math.floor(days / 7);
  const daysAfterWeeks = days % 7;
  // Less than a month
  if (weeks < 4) {
    if (daysAfterWeeks > 0) {
      return `${weeks}w ${daysAfterWeeks}d`;
    }
    return `${weeks}w`;
  }

  // Calculate months more accurately
  const currentDate = new Date(now);
  const months =
    (currentDate.getFullYear() - date.getFullYear()) * 12 +
    (currentDate.getMonth() - date.getMonth());

  // Calculate remaining days more accurately
  const tempDate = new Date(date.getTime());
  tempDate.setMonth(tempDate.getMonth() + months);
  const daysAfterMonths = Math.floor(
    (currentDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (months < 12) {
    if (daysAfterMonths > 0) {
      return `${months}mo ${daysAfterMonths}d`;
    }
    return `${months}mo`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths > 0) {
    return `${years}y ${remainingMonths}mo`;
  }
  return `${years}y`;
};
