import { major, rsort } from 'semver';
import { ScheduledVersion } from './schemas.js';
import { isActive } from './filter.js';

export const findScheduledVersion = (
  version: string,
  scheduledVersions: ScheduledVersion[],
) => {
  const scheduledVersion = scheduledVersions.find((scheduledVersion) => {
    return major(version) === scheduledVersion.version;
  });
  if (!scheduledVersion) {
    throw new Error(
      `Version ${version} of major ${major(version)} not found in scheduled versions.`,
    );
  }
  return scheduledVersion;
};

export const isLts = (
  version: string,
  versions: string[],
  scheduledVersions: ScheduledVersion[],
) => {
  if (!isLatestMajor(version, versions)) {
    return false;
  }

  const scheduledVersion = findScheduledVersion(version, scheduledVersions);

  return scheduledVersion.lts;
};

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
) => {
  const scheduledVersion = findScheduledVersion(version, scheduledVersions);
  return {
    version,
    isActive: isActive(scheduledVersion.start, scheduledVersion.end),
    isLts: !!(scheduledVersion.lts && isLatestMajor(version, versions)),
    major: isLatestMajor(version, versions) ? major(version) : false,
    latest: isLatest(version, versions),
  };
};
