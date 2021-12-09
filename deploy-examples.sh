#!/usr/bin/env bash
# Build React Example
cd examples/reactjs && yarn && yarn build && cd ../../
# Build Vue 3 Exmaple
cd examples/vuejs && yarn && yarn build && cd ../../
# Copy React example to docs
mkdir -p docs/examples/react && rm -rf docs/examples/react/* && mv examples/reactjs/build/* docs/examples/react
# Copy Vue exmaple to docs
mkdir -p docs/examples/vue && rm -rf docs/examples/vue/* && mv examples/vuejs/dist/* docs/examples/vue
# Copy Vanilla JS example to docs
mkdir -p docs/examples/vanilla && cp -f examples/vanillajs/* docs/examples/vanilla