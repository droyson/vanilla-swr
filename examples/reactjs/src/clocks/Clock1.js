import { useEffect, useState } from 'react'
import { months, pad0, useDateTime } from '../constants'
import styles from './clock1.module.css'

export function Clock1 ({ observable, fromApi }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const dateTime = useDateTime(observable, fromApi)

  useEffect(() => {
    if (dateTime) {
        setDate(`${dateTime.getDate()} ${months[dateTime.getMonth()]}, ${dateTime.getFullYear()}`)
        setTime(`${pad0(dateTime.getHours())}:${pad0(dateTime.getMinutes())}:${pad0(dateTime.getSeconds())}`)
    }
  }, [dateTime])

  return (
    <div className={styles.clockFace}>
      <span className={styles.time}>{time}</span>
      <span className={styles.date}>{date}</span>
    </div>
  )
}
