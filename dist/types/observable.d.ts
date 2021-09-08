import { Fetcher, Key, SWRConfiguration, SWRObservable, SWRWatcher, watchCallback } from './types';
export declare class Observable<Data = any, Error = any> implements SWRObservable<Data, Error> {
    private _watchers;
    private _keyIsFunction;
    private _key;
    private _fetcher;
    private _options;
    private _data;
    private _error;
    private _isValidating;
    private _lastFetchTs;
    private _errorRetryCounter;
    private _online;
    private _timer;
    constructor(key: Key, fetcher: Fetcher<Data>, options: SWRConfiguration<Data, Error>);
    private get response();
    watch(fn: watchCallback<Data, Error>): SWRWatcher;
    private _callWatchers;
    private _callFetcher;
    private _errorHandler;
    private _isVisible;
    private _initFocus;
    private _initReconnect;
}
