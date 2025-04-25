import { describe, expect, it } from 'vitest';
import { fetchSchedule, fetchVersions } from './fetch.js';
import { server } from '../mocks/server.js';
import { http, HttpResponse } from 'msw';
import { generateMock } from '@anatine/zod-mock';
import { scheduleDetailsSchema } from './schemas.js';
import { ZodError } from 'zod';

describe('fetch', () => {
  describe('fetchSchedule', () => {
    const generateVersion = () => {
      return `v${Math.floor(Math.random() * 100)}`;
    };
    const generateScheduleVersion = () => {
      return {
        [generateVersion()]: generateMock(scheduleDetailsSchema),
      };
    };
    const generateScheduleOutput = (
      scheduledVersion: ReturnType<typeof generateScheduleVersion>,
    ) => {
      return {
        ...Object.values(scheduledVersion)[0],
        version: parseInt(Object.keys(scheduledVersion)[0].replace('v', '')),
      };
    };
    it('should fetch and return a schedule', async () => {
      const mockSchedule = generateScheduleVersion();
      server.use(
        http.get(
          'https://raw.githubusercontent.com/nodejs/Release/refs/heads/main/schedule.json',
          () => {
            return HttpResponse.json(mockSchedule);
          },
        ),
      );

      const schedule = await fetchSchedule();

      expect(schedule).toEqual([generateScheduleOutput(mockSchedule)]);
    });

    it('should filter non-major versions', async () => {
      const mockSchedule = {
        ...generateScheduleVersion(),
        'v0.2': generateMock(scheduleDetailsSchema),
      };
      server.use(
        http.get(
          'https://raw.githubusercontent.com/nodejs/Release/refs/heads/main/schedule.json',
          () => {
            return HttpResponse.json(mockSchedule);
          },
        ),
      );

      const schedule = await fetchSchedule();

      expect(schedule).toEqual([generateScheduleOutput(mockSchedule)]);
    });

    it('should throw an error if the response does not match the schema', async () => {
      const mockSchedule = {
        'v1.0.0': {
          start: '2023-01-01',
          end: '2023-01-01',
          lts: 1234, // Invalid type, should be a string
        },
      };

      server.use(
        http.get(
          'https://raw.githubusercontent.com/nodejs/Release/refs/heads/main/schedule.json',
          () => {
            return HttpResponse.json(mockSchedule);
          },
        ),
      );

      await expect(fetchSchedule()).rejects.toThrow(ZodError);
    });

    it('should throw an error if the response is not ok', async () => {
      server.use(
        http.get(
          'https://raw.githubusercontent.com/nodejs/Release/refs/heads/main/schedule.json',
          () => {
            return HttpResponse.json({}, { status: 500 });
          },
        ),
      );

      await expect(fetchSchedule()).rejects.toThrowError();
    });
  });
  describe('fetchVersions', () => {
    const generateVersionHtml = (version: string) => {
      return `<a href="v${version}/">v${version}/</a>`;
    };
    const generateMockHtml = (versions: string[]) => {
      return versions.map(generateVersionHtml).join('');
    };

    it('should fetch and return a list of versions', async () => {
      const mockVersions = ['18.0.0', '19.0.0'];
      server.use(
        http.get('https://nodejs.org/dist/', () => {
          return HttpResponse.html(generateMockHtml(mockVersions));
        }),
      );

      const versions = await fetchVersions();

      expect(versions).toEqual(mockVersions);
    });

    it('should filter out non-major versions', async () => {
      const mockVersions = ['0.1.0', '1.0.0', '2.0.0'];
      server.use(
        http.get('https://nodejs.org/dist/', () => {
          return HttpResponse.html(generateMockHtml(mockVersions));
        }),
      );

      const versions = await fetchVersions();

      expect(versions).toEqual(['1.0.0', '2.0.0']);
    });

    it('should throw an error if the response is not ok', async () => {
      server.use(
        http.get('https://nodejs.org/dist/', () => {
          return HttpResponse.json({}, { status: 500 });
        }),
      );

      await expect(fetchVersions()).rejects.toThrowError();
    });
  });
});
