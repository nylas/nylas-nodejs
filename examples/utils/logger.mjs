// Pretty logger
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  info: '\x1b[36m',
  success: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[35m',
};

export function ts() {
  return new Date().toISOString();
}

export function maskSecret(value, visibleStart = 8, visibleEnd = 0) {
  if (!value) return '';
  const start = value.slice(0, visibleStart);
  const end = visibleEnd ? value.slice(-visibleEnd) : '';
  const hidden = Math.max(0, value.length - start.length - end.length);
  return `${start}${'•'.repeat(hidden)}${end}`;
}

export function print(level, symbol, message, meta) {
  const color = COLORS[level] || COLORS.info;
  const time = `${COLORS.dim}${ts()}${COLORS.reset}`;
  const label = `${color}${symbol} ${level.toUpperCase()}${COLORS.reset}`;
  const line =
    typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  console.log(`${time} ${label} ${line}`);
  if (meta !== undefined) {
    console.dir(meta, { depth: null, colors: true, maxArrayLength: 100 });
  }
}

export const logger = {
  info: (msg, meta) => print('info', 'ℹ', msg, meta),
  success: (msg, meta) => print('success', '✔', msg, meta),
  warn: (msg, meta) => print('warn', '⚠', msg, meta),
  error: (msg, meta) => print('error', '✖', msg, meta),
  debug: (msg, meta) => print('debug', '🐛', msg, meta),
};
