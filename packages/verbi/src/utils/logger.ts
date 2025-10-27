import pc from 'picocolors';

export const logger = {
  info(message: string, ...args: unknown[]) {
    console.log(pc.blue('ℹ'), message, ...args);
  },

  success(message: string, ...args: unknown[]) {
    console.log(pc.green('✓'), message, ...args);
  },

  warn(message: string, ...args: unknown[]) {
    console.warn(pc.yellow('⚠'), message, ...args);
  },

  error(message: string, ...args: unknown[]) {
    console.error(pc.red('✗'), message, ...args);
  },

  debug(message: string, ...args: unknown[]) {
    if (process.env.DEBUG === 'verbi' || process.env.DEBUG === '*') {
      console.log(pc.gray('[debug]'), message, ...args);
    }
  },

  progress(message: string) {
    console.log(pc.cyan('⟳'), message);
  },

  table(data: Record<string, unknown>[]) {
    console.table(data);
  },

  group(label: string) {
    console.group(pc.bold(label));
  },

  groupEnd() {
    console.groupEnd();
  },
};