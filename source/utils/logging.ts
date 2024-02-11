import log from 'loglevel';

export const levels = log.levels;

/**
 * Get a logger instance.
 * @param {string} name - The name of the logger.
 * @param {number|null} level - The log level (Overrides any previous level set for it).
 * @return {log.Logger} The logger.
 */
export function getLogger(name: string, level: 0 | 1 | 2 | 3 | 4 | 5 | null = null) {
  const logger = log.getLogger(name);
  if (level !== null) logger.setLevel(level);
  return logger;
}
