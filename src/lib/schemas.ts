import { valid } from 'semver';
import { z } from 'zod';

const scheduleDetails = z.object({
  start: z.string(),
  end: z.string(),
  lts: z.string().optional(),
  maintenance: z.string().optional(),
});

export const scheduleSchema = z.record(z.string(), scheduleDetails);

export interface ScheduledVersion extends z.infer<typeof scheduleDetails> {
  version: number;
}

const zodSemVer = z.string().refine((ver) => {
  return valid(ver);
}, 'Please enter a valid version (x.y.z)');

export const programSchema = z.object({
  min: zodSemVer.optional(),
  max: zodSemVer.optional(),
  inactive: z.boolean().optional().default(false),
  all: z.boolean().optional().default(false),
  pretty: z.boolean().optional().default(false),
});

export type ProgramArgs = z.infer<typeof programSchema>;
