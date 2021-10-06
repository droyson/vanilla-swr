<template>
  <div class="clockFace">
    <div class="time">{{time}}</div>
    <div class="date">{{date}}</div>
  </div>
</template>
<script>
import clockMixin from './clock.mixin'
import { months, pad0 } from '../../constants'

export default {
  name: 'Clock1',
  mixins: [clockMixin],
  data () {
    return {
      time: '',
      date: ''
    }
  },
  watch: {
    dateTime (newValue) {
      if (newValue) {
        this.date = `${newValue.getDate()} ${months[newValue.getMonth()]}, ${newValue.getFullYear()}`
        this.time = `${pad0(newValue.getHours())}:${pad0(newValue.getMinutes())}:${pad0(newValue.getSeconds())}`
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.clockFace {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-family: sans-serif;

  .time {
    color: blue;
  }

  .date {
    color: green;
  }
}
</style>
