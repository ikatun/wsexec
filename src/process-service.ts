import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import cryptoRandomString from 'crypto-random-string';
import _ from 'lodash';

interface ProcessInstance {
  token: string;
  process: ChildProcessWithoutNullStreams;
}

interface ProcessEvent {
  token: string;
  stdoutMessage?: string;
  stderrMessage?: string;
  exitCode?: number | null;
}

export class ProcessService {
  private processes: ProcessInstance[] = [];

  spawnProcess(command: string, args: string[]) {
    const token = cryptoRandomString({ length: 24, type: 'url-safe' }) as string;
    const process = spawn(command, args);
    this.processes.push({ process, token });

    return token;
  }

  private removeProcess(token: string) {
    console.log('removing process', token);
    _.remove(this.processes, (p) => p.token === token);
  }

  attachListeners(token: string, onEventSent: (event: ProcessEvent) => void) {
    const processInstance = this.processes.find((p) => p.token === token);
    if (!processInstance) {
      throw new Error('No such process');
    }

    const { process } = processInstance;

    process.stdout.on('data', (data) => {
      onEventSent({ stdoutMessage: data.toString(), token });
    });

    process.stderr.on('data', (data) => {
      onEventSent({ token, stderrMessage: data.toString() });
    });

    process.on('exit', (exitCode) => {
      onEventSent({ token, exitCode: exitCode });
      this.removeProcess(token);
    });
  }
}
