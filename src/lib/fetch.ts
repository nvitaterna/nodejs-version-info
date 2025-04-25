import { load } from 'cheerio';
import { NODEJS_SCHEDULE_URL, NODEJS_VERSIONS_URL } from './constants.js';
import { FetchedScheduledVersion, scheduleSchema } from './schemas.js';

export const fetchSchedule = async (): Promise<FetchedScheduledVersion[]> => {
  const response = await fetch(NODEJS_SCHEDULE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch schedule: ${response.statusText}`);
  }

  const data = scheduleSchema.parse(await response.json());

  return Object.entries(data)
    .filter(([version]) => {
      // omimtting out the 0.x versions
      return !version.includes('.');
    })
    .map(([version, { start, end, lts }]) => {
      return {
        version: parseInt(version.replace('v', '')),
        start,
        end,
        lts,
      };
    });
};

export const fetchVersions = async () => {
  const response = await fetch(NODEJS_VERSIONS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch versions: ${response.statusText}`);
  }

  const $ = load(await response.text());

  const versions = Array.from($('a'))
    .map((element) => {
      return $(element).text();
    })
    .filter((version) => {
      return version.startsWith('v') && !version.startsWith('v0');
    })
    .map((version) => {
      const matches = version.match(/v(.*)\//);
      return matches?.reverse()[0];
    })
    .filter((version): version is string => !!version);

  return versions;
};
