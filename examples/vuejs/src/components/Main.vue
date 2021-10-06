<template>
  <main>
    <div class="picker-container">
      <div>
        <span>Region:</span>
        <select v-model="currentRegion">
          <option v-for="region in regions" :key="region" :value="region">{{region}}</option>
        </select>
      </div>
      <div>
        <input type="checkbox" id="api" v-model="fromApi">
        <label for="api">Update only via API</label>
      </div>
    </div>
    <div class="clocks">
      <clock-1 :api="fromApi" :get-region="getRegion" />
      <clock-2 :api="fromApi" :get-region="getRegion" />
    </div>
  </main>
</template>

<script>
import SWR from 'vanilla-swr'
import { fetchTime } from '../constants'
import Clock1 from './clocks/Clock1'
import Clock2 from './clocks/Clock2'

export default {
  name: 'Main',
  components: {
    Clock1,
    Clock2
  },
  data () {
    return {
      regions: [],
      currentRegion: 'Asia/Kolkata',
      fromApi: false,
      observable: null
    }
  },
  async created () {
    this.observable = SWR(this.getRegion, fetchTime)
    const tzs = await fetch(`${window.location.protocol}//worldtimeapi.org/api/timezone`).then(res => res.json())
    this.regions = tzs
  },
  methods: {
    mutateObservable () {
      this.observable && this.observable.mutate({
        refreshInterval: this.fromApi ? 1000 : 0
      })
    },
    getRegion () {
      return this.currentRegion
    }
  },
  watch: {
    currentRegion () {
      this.mutateObservable()
    },
    fromApi () {
      this.mutateObservable()
    }
  }
}
</script>

<style lang="scss" scoped>
main {
  margin: 32px;
}
main span {
  margin-right: 8px;
}
.clocks {
  display: flex;
  justify-content: center;
  align-items: center;
}
.clocks > div+div {
  margin-left: 32px;
}
.picker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}
.picker-container > div+div {
  margin-left: 32px;
}

@media screen and (max-width: 640px) {
  .clocks {
    flex-direction: column;
  }
  .clocks > div+div {
    margin-left: 0px;
    margin-top: 32px;
  }
  .picker-container {
    flex-direction: column;
  }
  .picker-container > div+div {
    margin-left: 0px;
    margin-top: 24px;
  }
}
</style>
