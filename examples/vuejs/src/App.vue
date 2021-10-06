<template>
  <header>
    <h1>Vue Clock App</h1>
  </header>
  <Main></Main>
</template>

<script>
import Main from './components/Main'
export default {
  name: 'App',
  components: {
    Main
  }
}
</script>

<style scoped lang="scss">
header {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: aliceblue;
  box-shadow: 0 2px 4px 0px #0000004d;
}
header > h1 {
  margin: 0px;
}
</style>
