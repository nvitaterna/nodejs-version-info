import { gte, lte } from 'semver';
import { fetchSchedule, fetchVersions } from './lib/fetch.js';
import { isLatestMajor, mapVersion } from './lib/format.js';
import { ProgramArgs } from './lib/schemas.js';

export const main = async ({
  min,
  max,
  inactive,
  all,
}: Omit<ProgramArgs, 'pretty'>) => {
  const [versions, schedule] = await Promise.all([
    fetchVersions(),
    fetchSchedule(),
  ]);

  const mappedVersions = versions.map((version) => {
    return mapVersion(version, versions, schedule);
  });

  return mappedVersions
    .filter((mappedVersion) => {
      if (!min) {
        return true;
      }

      return gte(mappedVersion.version, min);
    })
    .filter((mappedVersion) => {
      if (!max) {
        return true;
      }
      return lte(mappedVersion.version, max);
    })
    .filter((mappedVersion) => {
      if (inactive) {
        return true;
      }
      return mappedVersion.isActive;
    })
    .filter((mappedVersion) => {
      if (all) {
        return true;
      }
      return isLatestMajor(mappedVersion.version, versions);
    })
    .sort((a, b) => {
      if (gte(a.version, b.version)) {
        return -1;
      } else if (lte(a.version, b.version)) {
        return 1;
      }
      return 0;
    });
};
