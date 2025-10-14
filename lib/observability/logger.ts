type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const counters: Record<string, number> = {}

function log(level: LogLevel, event: string, data?: Record<string, any>) {
  const ts = new Date().toISOString()
  const base: any = { ts, level, event }
  if (data) Object.assign(base, data)
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(base))
  } catch {
    console.log(ts, level, event, data)
  }
}

export function inc(metric: string, by = 1) {
  counters[metric] = (counters[metric] || 0) + by
}

export function snapshotMetrics() {
  return { ...counters }
}

export const logger = {
  debug: (e: string, d?: any) => log('debug', e, d),
  info: (e: string, d?: any) => log('info', e, d),
  warn: (e: string, d?: any) => log('warn', e, d),
  error: (e: string, d?: any) => log('error', e, d),
  inc,
  metrics: snapshotMetrics
}

export default logger