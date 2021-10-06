<template>
  <div>
    <canvas width="200" height="200" ref="canvasRef"></canvas>
  </div>
</template>
<script>
import clockMixin from './clock.mixin'
import { months } from '../../constants'

export default {
  name: 'Clock2',
  mixins: [clockMixin],
  data () {
    return {
      ctx: null,
      radius: 0
    }
  },
  methods: {
    drawClock (dateTime) {
      if (dateTime && this.ctx && this.radius) {
        const ctx = this.ctx
        const radius = this.radius
        this.drawFace(ctx, radius)
        this.drawNumbers(ctx, radius)
        this.drawTime(dateTime, ctx, radius)
        this.drawDate(dateTime, ctx, radius)
      }
    },
    drawFace (ctx, radius) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      ctx.fillStyle = 'white'
      ctx.fill()
      const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05)
      grad.addColorStop(0, '#333')
      grad.addColorStop(0.5, 'white')
      grad.addColorStop(1, '#333')
      ctx.strokeStyle = grad
      ctx.lineWidth = radius * 0.1
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI)
      ctx.fillStyle = '#333'
      ctx.fill()
    },
    drawNumbers (ctx, radius) {
      ctx.font = radius * 0.15 + 'px arial'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      for (let num = 1; num < 13; num++) {
        const ang = num * Math.PI / 6
        ctx.rotate(ang)
        ctx.translate(0, -radius * 0.85)
        ctx.rotate(-ang)
        ctx.fillText(num.toString(), 0, 0)
        ctx.rotate(ang)
        ctx.translate(0, radius * 0.85)
        ctx.rotate(-ang)
      }
    },
    drawTime (now, ctx, radius) {
      let hour = now.getHours()
      let minute = now.getMinutes()
      let second = now.getSeconds()
      const amPm = hour < 12 ? 'AM' : 'PM'
      // hour
      hour = hour % 12
      hour = (hour * Math.PI / 6) +
      (minute * Math.PI / (6 * 60)) +
      (second * Math.PI / (360 * 60))
      this.drawHand(ctx, hour, radius * 0.5, radius * 0.07)
      // minute
      minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60))
      this.drawHand(ctx, minute, radius * 0.8, radius * 0.07)
      // second
      second = (second * Math.PI / 30)
      this.drawHand(ctx, second, radius * 0.9, radius * 0.02)
      ctx.font = radius * 0.15 + 'px arial'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      const top = 2 * Math.PI
      ctx.rotate(top)
      ctx.translate(0, -radius * 0.65)
      ctx.rotate(-top)
      ctx.fillStyle = '#ff0000'
      ctx.fillText(amPm, 0, 0)
      ctx.rotate(top)
      ctx.translate(0, radius * 0.65)
      ctx.rotate(-top)
    },
    drawHand (ctx, pos, length, width) {
      ctx.beginPath()
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.moveTo(0, 0)
      ctx.rotate(pos)
      ctx.lineTo(0, -length)
      ctx.stroke()
      ctx.rotate(-pos)
    },
    drawDate (now, ctx, radius) {
      const date = now.getDate()
      const month = months[now.getMonth()]
      const year = now.getFullYear()
      const left = 3 * Math.PI / 2
      ctx.rotate(left)
      ctx.translate(0, -radius * 0.45)
      ctx.rotate(-left)
      ctx.fillStyle = '#0000ff'
      ctx.fillText(date + ' ' + month, 0, 0)
      ctx.rotate(left)
      ctx.translate(0, radius * 0.45)
      ctx.rotate(-left)
      const right = Math.PI / 2
      ctx.rotate(right)
      ctx.translate(0, -radius * 0.45)
      ctx.rotate(-right)
      ctx.fillStyle = '#0000ff'
      ctx.fillText(year.toString(), 0, 0)
      ctx.rotate(right)
      ctx.translate(0, radius * 0.45)
      ctx.rotate(-right)
    }
  },
  mounted () {
    const canvas = this.$refs.canvasRef
    this.ctx = canvas.getContext('2d')
    const center = canvas.height / 2
    this.ctx.translate(center, center)
    this.radius = center * 0.9
  },
  watch: {
    dateTime (newValue) {
      if (newValue) {
        this.drawClock(newValue)
      }
    }
  }
}
</script>
