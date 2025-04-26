import { Command } from '@commander-js/extra-typings';
import { programSchema } from './lib/schemas.js';
import { main } from './main.js';

const program = new Command();

program
  .name('nodejs-version-info')
  .description('CLI to get nodejs version data.')
  .version('0.0.1')
  .command('list')
  .description('Output a list of node.js versions')
  .option('--min <string>', 'Minimum semversion to output.')
  .option('--max <string>', 'Maximum semversion to output.')
  .option('--inactive', 'Include inactive versoins.')
  .option('--all', 'Include all minor and patch versions.')
  .option('--pretty', 'Output formatted json.')
  .action(async (options) => {
    const { min, max, inactive, all, pretty } = programSchema.parse(options);

    const filteredVersions = await main({
      min,
      max,
      inactive,
      all,
    });

    const versionList = filteredVersions.map((version) => {
      return {
        version: version.version,
        lts: version.isLts,
        latest: version.latest,
        major: version.major,
        current: version.latest,
      };
    });

    let output: string;

    if (pretty) {
      output = JSON.stringify(versionList, null, 2);
    } else {
      output = JSON.stringify(versionList);
    }

    console.log(output);
  });

program.parse();
