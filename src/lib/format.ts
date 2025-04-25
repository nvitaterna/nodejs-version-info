import { major, rsort } from 'semver';
import { ScheduledVersion } from './scheduled-version.js';

export interface MappedVersion {
  version: string;
  isActive: boolean;
  isLts: boolean;
  major: number | boolean;
  latest: boolean;
}

export const isLatestMajor = (version: string, versions: string[]) => {
  const latestForMajor = rsort([...versions]).find((v) => {
    return major(v) === major(version);
  });

  return version === latestForMajor;
};

const isLatest = (version: string, versions: string[]) => {
  const sortedVersions = rsort([...versions]);

  return version === sortedVersions[0];
};

export const mapVersion = (
  version: string,
  versions: string[],
  scheduledVersions: ScheduledVersion[],
): MappedVersion | null => {
  const scheduledVersion = ScheduledVersion.findScheduledVersion(
    version,
    scheduledVersions,
  );

  if (!scheduledVersion) {
    return null;
  }

  return {
    version,
    isActive: scheduledVersion.isActive,
    isLts: scheduledVersion.isLts && isLatestMajor(version, versions),
    major: isLatestMajor(version, versions) ? major(version) : false,
    latest: isLatest(version, versions),
  };
};
