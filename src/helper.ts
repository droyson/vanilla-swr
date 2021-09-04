import { Key, SWRObservable, ValueKey } from './types'

export const isObservable = (obj: SWRObservable | null | undefined): obj is SWRObservable => {
  return typeof obj?.watch !== 'undefined' 
}

export const isFunction = (fn: Key): fn is () => ValueKey => {
  return typeof fn === 'function'
}

export const deepEqual = (a: unknown, b: unknown): boolean => {
  const has = Object.prototype.hasOwnProperty
  let ctor
  if (a === b) {
    return true
  }

  if (a && b && (ctor = (a as any).constructor) === (b as any).constructor) {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime()
    }
    if (a instanceof RegExp && b instanceof RegExp) {
      return a.toString() === b.toString()
    }

    if (a instanceof Array && b instanceof Array) {
      let len
      if ((len = a.length) === b.length) {
        while (len-- && deepEqual(a[len], b[len]));
      }
      return len === -1
    }

    if (!ctor || typeof a === 'object') {
      let len = 0
      for (ctor in (a as any)) {
        if (has.call(a, ctor) && ++len && !has.call(b, ctor)) {
          return false
        }
        if (!(ctor in (b as any)) || !deepEqual((a as any)[ctor], (b as any)[ctor])) {
          return false
        }
      }
      return Object.keys((b as any)).length === len
    }
  }

  return a !== a && b !== b
}

export const noop = (): undefined => undefined
