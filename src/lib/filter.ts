import { ScheduledVersion } from './schemas.js';

export const isActive = (startDate: string, endDate: string) => {
  const now = new Date().getTime();
  return (
    new Date(startDate).getTime() <= now && new Date(endDate).getTime() >= now
  );
};

export const isLts = (
  version: string,
  scheduledVersions: ScheduledVersion[],
) => {
  const now = new Date().getTime();
};
