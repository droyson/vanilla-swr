import { Key, SWRObservable, ValueKey } from './types'

export const isObservable = (obj: SWRObservable | null | undefined): obj is SWRObservable => {
  return typeof obj?.watch !== 'undefined' 
}

export const isFunction = (fn: Key): fn is () => ValueKey => {
  return typeof fn === 'function'
}
