import { Key, SWRObservable, ValueKey } from './types';
export declare const isObservable: (obj: SWRObservable | null | undefined) => obj is SWRObservable<any, any>;
export declare const isFunction: (fn: Key) => fn is () => ValueKey;
export declare const deepEqual: (a: unknown, b: unknown) => boolean;
export declare const noop: () => undefined;
