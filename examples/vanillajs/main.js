/* global SWR */

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad0 (value) {
  return value.toString().padStart(2, '0')
}

class Clock {
  constructor () {
    this.dateTime = null
    this.update = this._update.bind(this)
    this.timer = null
    this.autoUpdate = true
  }

  init () {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.autoUpdate) {
      this.timer = setInterval(() => {
        if (this.dateTime) {
          this.setDateTime(this.dateTime)
          this.dateTime = new Date(this.dateTime.getTime() + 1000)
        }
      }, 1000)
    } else {
      if (this.dateTime) {
        this.setDateTime(this.dateTime)
      }
    }
  }

  setDateTime (dateTime) {
    console.log('date is', dateTime.toDateString())
    console.log('time is', dateTime.toTimeString())
  }

  _update ({ data }) {
    this.dateTime = data
    this.init()
  }
}

class Clock1 extends Clock {
  constructor () {
    super()
    this.dateEl = document.getElementById('date-1')
    this.timeEl = document.getElementById('time-1')
  }
  setDateTime (dateTime) {
    const date = dateTime.getDate() + ' ' + months[dateTime.getMonth()] + ', '+ dateTime.getFullYear()
    this.dateEl.innerText = date
    const time = pad0(dateTime.getHours()) + ':' + pad0(dateTime.getMinutes()) + ':' + pad0(dateTime.getSeconds())
    this.timeEl.innerText = time
  }
}

// Code reference - https://www.w3schools.com/graphics/tryit.asp?filename=trycanvas_clock_start
class Clock2 extends Clock {
  constructor () {
    super()
    const canvas = document.getElementById('analog-canvas')
    this.ctx = canvas.getContext('2d')
    const center = canvas.height / 2
    this.ctx.translate(center, center)
    this.radius = center * 0.9
  }

  drawFace (ctx, radius) {
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, 2*Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    const grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05)
    grad.addColorStop(0, '#333')
    grad.addColorStop(0.5, 'white')
    grad.addColorStop(1, '#333')
    ctx.strokeStyle = grad
    ctx.lineWidth = radius*0.1
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI)
    ctx.fillStyle = '#333'
    ctx.fill()
  }

  drawNumbers (ctx, radius) {
    ctx.font = radius*0.15 + 'px arial'
    ctx.textBaseline='middle'
    ctx.textAlign='center'
    for(let num = 1; num < 13; num++){
      const ang = num * Math.PI / 6
      ctx.rotate(ang)
      ctx.translate(0, -radius*0.85)
      ctx.rotate(-ang)
      ctx.fillText(num.toString(), 0, 0)
      ctx.rotate(ang)
      ctx.translate(0, radius*0.85)
      ctx.rotate(-ang)
    }
  }

  drawTime(now, ctx, radius) {
    let hour = now.getHours()
    let minute = now.getMinutes()
    let second = now.getSeconds()
    const amPm = hour < 12 ? 'AM' : 'PM'
    //hour
    hour=hour%12
    hour=(hour*Math.PI/6)+
    (minute*Math.PI/(6*60))+
    (second*Math.PI/(360*60))
    this.drawHand(ctx, hour, radius*0.5, radius*0.07)
    //minute
    minute=(minute*Math.PI/30)+(second*Math.PI/(30*60))
    this.drawHand(ctx, minute, radius*0.8, radius*0.07)
    // second
    second=(second*Math.PI/30)
    this.drawHand(ctx, second, radius*0.9, radius*0.02)
    ctx.font = radius*0.15 + 'px arial'
    ctx.textBaseline='middle'
    ctx.textAlign='center'
    const top = 2 * Math.PI
    ctx.rotate(top)
    ctx.translate(0, -radius*0.65)
    ctx.rotate(-top)
    ctx.fillStyle = '#ff0000'
    ctx.fillText(amPm, 0, 0)
    ctx.rotate(top)
    ctx.translate(0, radius*0.65)
    ctx.rotate(-top)
  }

  drawDate (now, ctx, radius) {
    let date = now.getDate()
    let month = months[now.getMonth()]
    let year = now.getFullYear()
    const left = 3 * Math.PI / 2
    ctx.rotate(left)
    ctx.translate(0, -radius*0.45)
    ctx.rotate(-left)
    ctx.fillStyle = '#0000ff'
    ctx.fillText(date + ' ' + month, 0, 0)
    ctx.rotate(left)
    ctx.translate(0, radius*0.45)
    ctx.rotate(-left)
    const right = Math.PI / 2
    ctx.rotate(right)
    ctx.translate(0, -radius*0.45)
    ctx.rotate(-right)
    ctx.fillStyle = '#0000ff'
    ctx.fillText(year.toString(), 0, 0)
    ctx.rotate(right)
    ctx.translate(0, radius*0.45)
    ctx.rotate(-right)
  }

  drawHand(ctx, pos, length, width) {
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.moveTo(0,0)
    ctx.rotate(pos)
    ctx.lineTo(0, -length)
    ctx.stroke()
    ctx.rotate(-pos)
  }

  setDateTime (dateTime) {
    this.drawFace(this.ctx, this.radius)
    this.drawNumbers(this.ctx, this.radius)
    this.drawTime(dateTime, this.ctx, this.radius)
    this.drawDate(dateTime, this.ctx, this.radius)
  }
}

const clock1 = new Clock1()
const clock2 = new Clock2()

!(function (clocks) {
  async function initRegionPicker () {
    const timezones = await fetch('http://worldtimeapi.org/api/timezone').then(res => res.json())
    const regionPicker = document.getElementById('region-picker')
    
    for (const timezone of timezones) {
      const option = document.createElement('option')
      option.value = timezone
      option.innerText = timezone
      if (timezone === selectedRegion) {
        option.selected = true
      }
      regionPicker.appendChild(option)
    }
    regionPicker.onchange = function () {
      selectedRegion = regionPicker.value
      observable.mutate()
    }

    const apiUpdate = document.getElementById('api')
    apiUpdate.onchange = function () {
      const updateViaApi = apiUpdate.checked
      for (const clock of clocks) {
        clock.autoUpdate = !updateViaApi
      }
      observable.mutate({
        refreshInterval: updateViaApi ? 1000 : 0
      })
    }
  }

  let selectedRegion = 'Asia/Kolkata'
  initRegionPicker()

  async function fetchTime (region) {
    const { datetime } = await fetch(`http://worldtimeapi.org/api/timezone/${region}`).then(res => res.json())
    const tzIndex = datetime.search(/(-|\+)\d{2}:\d{2}/)
    return new Date(datetime.substring(0, tzIndex))
  }

  function getSelectedRegion () {
    return selectedRegion
  }
  const observable = SWR(getSelectedRegion, fetchTime)
  
  for (const clock of clocks) {
    observable.watch(clock.update)
  }
})([clock1, clock2])
