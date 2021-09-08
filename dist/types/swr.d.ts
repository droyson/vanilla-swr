import { Fetcher, Key, SWRObservable } from './types';
declare const swrHandler: <Data = any, Error_1 = any>(key: Key, fetcher: Fetcher<Data>, options?: Partial<import("./types").PublicConfiguration<Data, Error_1>> | undefined) => SWRObservable<Data, Error_1>;
export default swrHandler;
