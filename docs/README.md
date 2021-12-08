# Vanilla SWR

`stale-while-revalidate` caching strategy for vanilla web-apps

## Installation

### npm

```
npm install vanilla-swr
```

OR

### yarn

```
yarn add vanilla-swr
```

OR

### Import it from a CDN

#### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/vanilla-swr@1.0.2/dist/index.min.js"></script>
```

#### unpkg

```html
<script src="https://unpkg.com/vanilla-swr@1.0.2/dist/index.js"></script>
```

`SWR` variable is present in the window object.

## Quick Start

```typescript
import SWR from "vanilla-swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const observable = SWR("/api/data", fetcher);
// Use window.SWR("/api/data", fetcher) instead when using from the script tag

// Add a watcher to start fetching data
const watcher = observable.watch(({ data, error }) => {
  // data - data for given key resolved by fetcher
  // error - error thrown by fetcher
});

// Remove watcher when not needed
watcher.unwatch();
```

## API

```typescript
import SWR, {Key, Fetcher, SWRConfiguration, SWRObservable, SWRWatcher} from 'vanilla-swr'
const observable: SWRObservable = SWR(key: Key, fetcher: Fetcher, options: SWRConfiguration)
// Add watcher
const watcher: SWRWatcher = observable.watch(({data, error, isValidating}: SWRResponse) => {
  // callback called initially and on value update
})
// Remove watcher
watcher.unwatch()
```

### Parameters

- `key`: a unique key string for the request (or a function / array ). [(details)](#Arguments)
- `fetcher`: a Promise returning function to fetch your data
- `options`: (optional) an object of options for this SWR

### SWRObservable

- `watch`: receives a callback that is called with resolved value or rejected error of fetcher. Returns [Watcher](#SWRWatcher).

  Multiple watchers can be added to same observable.

- `mutate(options?)`: call mutate to manually trigger a revalidate. Optionally receives options to update the existing [SWRConfiguration](#SWRConfiguration).

### SWRWatcher

- `unwatch`: removes the watcher from the observable.

### SWRResponse

- `data`: data for the given key resolved by `fetcher` (or `undefined` if not loaded)
- `error`: error thrown by `fetcher` (or `undefined`)
- `isValidating`: if there's a request or revalidation loading

### SWRConfiguration

- `fallbackData`: initial data to be returned.
- `revalidateOnWatch` (default = `true`): automatic revalidation when new watcher is added
- `revalidateOnFocus` (default = `true`): automatic revalidation when window gets focused
- `revalidateOnReconnect` (default = `true`): automatic revalidation when browser regains network connection
- `dedupingInterval` (default = `2000`): dedupe requests from the same key in this time span
- `shouldRetryOnError` (default = `true`): retry when fetcher has an error
- `errorRetryInterval` (default = `5000`): error retry interval
- `errorRetryCount` (default = `5`): max error retry count
- `refreshInterval` (default = `0`): polling interval. Provide a positive integer value. Disabled by default
- `refreshWhenHidden` (default = `false`): polling when the window is invisible (if `refreshInterval` is enabled)
- `refreshWhenOffline` (default = `false`): polling when browser is offline (if `refreshInterval` is enabled)
- `onSuccess(data, key, config)`: callback function when a request finishes successfully
- `onError(error, key, config)`: callback function when a request returns an error
- `onErrorRetry(error, key, config, revalidate, revalidateOps)`: handler for error retry. [(details)](#Error-Retry)
  - `data`: data resolved by `fetcher`
  - `error`: error thrown by `fetcher`
  - `key`: string value used to make the request
  - `config`: same as [SWRConfiguration](#SWRConfiguration). Readonly.
  - `revalidate`: function used to revalidate the data. Consumer should call this function to in
  - `revalidateOpts`: object containing `retryCount`.
- `compare(a, b)`: Comparison function used to detect when the resolved data has changed.

## Arguments

By default, `key` will be passed to `fetcher` as the argument. So the following 3 expressions are equivalent:

```typescript
SWR("/api/data", () => fetch("/api/data"));
SWR("/api/data", (url) => fetch(url));
SWR("/api/data", fetch);
```

### Multiple arguments

In some scenarios, it's useful to pass multiple arguments (can be any value or object) to the `fetcher` function. For example an authorized fetch request:

```typescript
SWR("/api/data", (url) => fetchWithToken(url, token));
```

This is **incorrect**. If `token` changes, SWR will still use the same key and return the wrong data.

Instead, you can use an **array** as the `key` parameter, which contains multiple arguments of `fetcher`:

```typescript
SWR(["/api/data", token], fetchWithToken);
```

The function `fetchWithToken` still accepts the same 2 arguments, but the cache key will also be associated with `token` now.

### Runtime arguments

In some scenarios, the key may not be known while initializing `SWR` or may change at later point in time. You can use **function** as a `key` parameter, which returns a **string**, an **array** or **null**. If the returned value is **null** the `fetcher` won't be executed.

```typescript
SWR(() => {
  if (token) {
    return ["/api/data", token];
  }
  return null;
}, fetchWithToken);
```

## Error Retry

SWR uses the [exponential backoff algorithm](https://en.wikipedia.org/wiki/Exponential_backoff) to retry the request on error. The algorithm allows the app to recover from errors quickly, but not waste resources retrying too often.

You can also override this behavior via the `onErrorRetry` option:

```typescript
const observable = SWR("/api/data", fetcher, {
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404.
    if (error.status === 404) return;

    // Never retry for a specific key.
    if (key === "/api/user") return;

    // Only retry up to 10 times.
    if (retryCount >= 10) return;

    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
});
```

## Examples

Below are examples using SWR in vanilla JS and other popular frameworks.

- Vanilla JS - [Code](https://github.com/droyson/vanilla-swr/tree/main/examples/vanillajs) - [Demo]($locationOrigin$/examples/vanilla/)
- React JS - [Code](https://github.com/droyson/vanilla-swr/tree/main/examples/reactjs) - [Demo]($locationOrigin$/examples/react/)
- Vue JS (Vue 3) - [Code](https://github.com/droyson/vanilla-swr/tree/main/examples/vuejs) - [Demo]($locationOrigin$/examples/vue/)
