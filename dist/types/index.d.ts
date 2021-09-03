declare module swr
{
	import { Key, SWRObservable, ValueKey } from './types';
	export const isObservable: (obj: SWRObservable | null | undefined) => obj is SWRObservable<any, any>;
	export const isFunction: (fn: Key) => fn is () => ValueKey;



	import { Fetcher, Key, SWRConfiguration, SWRObservable, SWRWatcher, watchCallback } from './types';
	export class Observable<Data = any, Error = any> implements SWRObservable<Data, Error> {
	    private _watchers;
	    private _keyIsFunction;
	    private _key;
	    private _fetcher;
	    private _options;
	    private _data;
	    private _error;
	    private _isValidating;
	    constructor(key: Key, fetcher: Fetcher<Data>, options: SWRConfiguration);
	    watch(fn: watchCallback<Data, Error>): SWRWatcher;
	    private _callWatchers;
	    private _callFetcher;
	}

	import { Fetcher, Key, SWRConfiguration, SWRObservable } from './types';
	const swrHandler: <Data = any, Error_1 = any>(key: Key, fetcher: Fetcher<Data>, options: SWRConfiguration) => SWRObservable<Data, Error_1>;
	export default swrHandler;

	export type ValueKey = string | any[];
	export type Key = ValueKey | (() => ValueKey | null);
	export type Fetcher<Data> = (...args: any[]) => Data | Promise<Data>;
	export interface PublicConfiguration {
	    loadingTimeout: number;
	}
	export type SWRConfiguration = Partial<PublicConfiguration>;
	export type SWRResponse<Data, Error> = {
	    data: Data | undefined;
	    error: Error | undefined;
	    isValidating: boolean;
	};
	export type watchCallback<Data = any, Error = any> = (response: SWRResponse<Data, Error>) => any;
	export interface SWRWatcher {
	    unwatch(): void;
	}
	export interface SWRObservable<Data = any, Error = any> {
	    watch(fn: watchCallback<Data, Error>): SWRWatcher;
	}
	export type Cache<Data = any> = {
	    get(key: Key): Data | null | undefined;
	    set(key: Key, value: Data): void;
	    delete(key: Key): void;
	};

}