# Vanilla SWR

`stale-while-revalidate` caching strategy for vanilla web-apps

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/droyson/vanilla-swr/build)
[![Coverage Status](https://coveralls.io/repos/github/droyson/vanilla-swr/badge.svg?branch=main)](https://coveralls.io/github/droyson/vanilla-swr?branch=main)

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
<script src="https://cdn.jsdelivr.net/npm/vanilla-swr/dist/index.min.js"></script>
```

#### unpkg

```html
<script src="https://unpkg.com/vanilla-swr/dist/index.js"></script>
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

## Documentation

https://vanilla-swr.js.org/

## License

MIT
