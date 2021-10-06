import SWR from 'vanilla-swr'
import { fetchTime } from '../../constants'

export default {
  props: {
    api: {
      type: Boolean,
      default: false
    },
    getRegion: {
      type: Function
    }
  },
  data () {
    return {
      dateTime: undefined,
      watcher: null,
      timer: null
    }
  },
  created () {
    const observable = SWR(this.getRegion, fetchTime)
    this.watcher = observable.watch(({ data }) => {
      this.dateTime = data
    })
  },
  beforeUnmount () {
    this.watcher && this.watcher.unwatch()
  },
  watch: {
    dateTime (newValue) {
      if (newValue) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        if (!this.api) {
          this.timer = setTimeout(() => {
            this.dateTime = new Date(newValue.getTime() + 1000)
          }, 1000)
        }
      }
    }
  }
}
