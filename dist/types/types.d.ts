export declare type ValueKey = string | any[];
export declare type Key = ValueKey | (() => ValueKey | null);
export declare type Fetcher<Data> = (...args: any[]) => Data | Promise<Data>;
export declare type RevalidateOption = {
    retryCount: number;
};
export interface PublicConfiguration<Data = any, Error = any> {
    compare: (a: Data | undefined, b: Data | undefined) => boolean;
    dedupingInterval: number;
    fallbackData: Data | undefined;
    onSuccess: (data: Data, key: string, config: Readonly<PublicConfiguration>) => any;
    onError: (err: Error, key: string, config: Readonly<PublicConfiguration>) => any;
    shouldRetryOnError: boolean;
    errorRetryInterval: number;
    errorRetryCount: number;
    onErrorRetry?: (err: Error, key: string, config: Readonly<PublicConfiguration>, revalidate: () => void, revalidateOpts: RevalidateOption) => any;
    refreshInterval: number;
    revalidateOnWatch: boolean;
    revalidateOnFocus: boolean;
    revalidateOnReconnect: boolean;
    refreshWhenHidden: boolean;
    refreshWhenOffline: boolean;
}
export declare type SWRConfiguration<Data, Error> = Partial<PublicConfiguration<Data, Error>>;
export declare type SWRResponse<Data, Error> = {
    data: Data | undefined;
    error: Error | undefined;
    isValidating: boolean;
};
export declare type watchCallback<Data = any, Error = any> = (response: SWRResponse<Data, Error>) => any;
export interface SWRWatcher {
    unwatch(): void;
}
export interface SWRObservable<Data = any, Error = any> {
    watch(fn: watchCallback<Data, Error>): SWRWatcher;
    mutate(options?: SWRConfiguration<Data, Error>): void;
}
export declare type Cache<Data = any> = {
    get(key: Key): Data | null | undefined;
    set(key: Key, value: Data): void;
    delete(key: Key): void;
};
