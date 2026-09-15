export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogFields = Record<string, unknown>;

function write(level: LogLevel, msg: string, fields?: LogFields): void {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...fields,
  });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (msg: string, fields?: LogFields) => write('debug', msg, fields),
  info: (msg: string, fields?: LogFields) => write('info', msg, fields),
  warn: (msg: string, fields?: LogFields) => write('warn', msg, fields),
  error: (msg: string, fields?: LogFields) => write('error', msg, fields),
  child(bindings: LogFields) {
    return {
      debug: (msg: string, fields?: LogFields) => write('debug', msg, { ...bindings, ...fields }),
      info: (msg: string, fields?: LogFields) => write('info', msg, { ...bindings, ...fields }),
      warn: (msg: string, fields?: LogFields) => write('warn', msg, { ...bindings, ...fields }),
      error: (msg: string, fields?: LogFields) => write('error', msg, { ...bindings, ...fields }),
    };
  },
};

export type Logger = typeof logger;
