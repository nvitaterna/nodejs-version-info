import { major } from 'semver';
import { FetchedScheduledVersion } from './schemas.js';
import { getDate, getNow } from './utils.js';

export class ScheduledVersion {
  public readonly isActive: boolean;

  constructor(
    public readonly majorVersion: number,
    public readonly isLts: boolean,
    start: string,
    end: string,
  ) {
    this.isActive = this.getIsActive(start, end);
  }

  private getIsActive(start: string, end: string) {
    const now = getNow();
    const startDate = getDate(start);
    const endDate = getDate(end);

    return startDate <= now && endDate >= now;
  }

  public static findScheduledVersion(
    version: string,
    scheduledVersions: ScheduledVersion[],
  ) {
    const scheduledVersion = scheduledVersions.find((scheduledVersion) => {
      return major(version) === scheduledVersion.majorVersion;
    });

    if (!scheduledVersion) {
      return null;
    }

    return scheduledVersion;
  }

  public static getFetchedScheduledLtsVersion(
    fetchedScheduledVersions: FetchedScheduledVersion[],
  ) {
    const now = getNow();
    const ltsFetchedScheduledVersions = fetchedScheduledVersions
      .filter(
        (
          fetchedScheduledVersion,
        ): fetchedScheduledVersion is FetchedScheduledVersion & {
          lts: string;
        } => !!fetchedScheduledVersion.lts,
      )
      .filter((fetchedScheduledVersion) => {
        return getDate(fetchedScheduledVersion.lts) <= now;
      });

    const ltsScheduledVersion = ltsFetchedScheduledVersions.reduce(
      (fetchedScheduledLtsVersion, fetchedScheduledVersion) => {
        if (!fetchedScheduledLtsVersion) {
          return fetchedScheduledVersion;
        }
        const previousLtsDate = getDate(fetchedScheduledLtsVersion.lts);
        const ltsDate = getDate(fetchedScheduledVersion.lts);
        if (ltsDate >= previousLtsDate) {
          return fetchedScheduledVersion;
        }
        return fetchedScheduledLtsVersion;
      },
    );

    return ltsScheduledVersion;
  }
}
