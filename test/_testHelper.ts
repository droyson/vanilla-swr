import { promisify } from 'util'

export const asyncNextTick = promisify(queueMicrotask)
