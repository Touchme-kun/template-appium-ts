import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';

interface PackageJson {
  scripts?: Record<string, string>;
}

interface ScriptChoice {
  index: number;
  name: string;
  command: string;
}

function loadScripts(): ScriptChoice[] {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const raw = fs.readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw) as PackageJson;

  if (!pkg.scripts || Object.keys(pkg.scripts).length === 0) {
    throw new Error('No npm scripts found in package.json');
  }

  const entries = Object.entries(pkg.scripts).sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([name, command], idx) => ({
    index: idx + 1,
    name,
    command,
  }));
}

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function runScript(choice: ScriptChoice): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', choice.name], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main(): Promise<void> {
  const scripts = loadScripts();
  const rl = createInterface();

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log('\nAvailable npm scripts:\n');
      scripts.forEach((script) => {
        console.log(`${script.index}. ${script.name} -> ${script.command}`);
      });
      console.log('q. Quit');

      const answer = await askQuestion(rl, '\nSelect a script to run (number or q): ');

      if (answer.toLowerCase() === 'q') {
        break;
      }

      const index = Number.parseInt(answer, 10);
      if (Number.isNaN(index)) {
        console.log('Invalid input. Please enter a number or q to quit.');
        continue;
      }

      const choice = scripts.find((s) => s.index === index);
      if (!choice) {
        console.log('Invalid selection. Please choose a valid number.');
        continue;
      }

      console.log(`\nRunning: npm run ${choice.name}\n`);
      try {
        await runScript(choice);
        console.log(`\nScript "${choice.name}" completed successfully.`);
      } catch (error) {
        console.error(`\nScript "${choice.name}" failed:`, error instanceof Error ? error.message : String(error));
      }

      const again = await askQuestion(rl, '\nRun another script? (y/N): ');
      if (again.toLowerCase() !== 'y') {
        break;
      }
    }
  } catch (error) {
    console.error('Error in npm interactive runner:', error instanceof Error ? error.message : String(error));
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
