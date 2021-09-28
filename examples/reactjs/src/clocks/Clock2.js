import { useEffect, useRef, useState } from "react";
import { useDateTime, months } from "../constants";

// Code reference - https://www.w3schools.com/graphics/tryit.asp?filename=trycanvas_clock_start
function drawFace (ctx, radius) {
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

function drawNumbers (ctx, radius) {
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

function drawTime (now, ctx, radius) {
  let hour = now.getHours()
  let minute = now.getMinutes()
  let second = now.getSeconds()
  const amPm = hour < 12 ? 'AM' : 'PM'
  //hour
  hour=hour%12
  hour=(hour*Math.PI/6)+
  (minute*Math.PI/(6*60))+
  (second*Math.PI/(360*60))
  drawHand(ctx, hour, radius*0.5, radius*0.07)
  //minute
  minute=(minute*Math.PI/30)+(second*Math.PI/(30*60))
  drawHand(ctx, minute, radius*0.8, radius*0.07)
  // second
  second=(second*Math.PI/30)
  drawHand(ctx, second, radius*0.9, radius*0.02)
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

function drawHand (ctx, pos, length, width) {
  ctx.beginPath()
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.moveTo(0,0)
  ctx.rotate(pos)
  ctx.lineTo(0, -length)
  ctx.stroke()
  ctx.rotate(-pos)
}

function drawDate (now, ctx, radius) {
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

export function Clock2 ({ observable, fromApi }) {
  const dateTime = useDateTime(observable, fromApi)
  const [ctx, setCtx] = useState()
  const [radius, setRadius] = useState()
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const center = canvas.height / 2
    ctx.translate(center, center)
    const radius = center * 0.9
    setCtx(ctx)
    setRadius(radius)
  }, [canvasRef])

  useEffect(() => {
    if (dateTime && ctx && radius) {
      drawFace(ctx, radius)
      drawNumbers(ctx, radius)
      drawTime(dateTime, ctx, radius)
      drawDate(dateTime, ctx, radius)
    }
  }, [dateTime, ctx, radius])

  return (
    <div id="clock-face-2">
      <canvas ref={canvasRef} id="analog-canvas" width="200" height="200"></canvas>
    </div>
  )
}
