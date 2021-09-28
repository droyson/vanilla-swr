import { useState, useEffect } from 'react'
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function fetchTime (region) {
  const { datetime } = await fetch(`${window.location.protocol}//worldtimeapi.org/api/timezone/${region}`).then(res => res.json())
  const tzIndex = datetime.search(/(-|\+)\d{2}:\d{2}/)
  return new Date(datetime.substring(0, tzIndex))
}

export function pad0 (value) {
  return value.toString().padStart(2, '0')
}

export function useDateTime (observable, fromApi) {
  const [dateTime, setDateTime] = useState()

  useEffect(() => {
    if (observable) {
      const watcher = observable.watch(({data}) => {
        if (data) {
          setDateTime(data)
        }
      })
  
      return () => {
        watcher.unwatch()
      }
    }
  }, [observable])

  useEffect(() => {
    if (!fromApi) {
      const timer = setInterval(() => {
        setDateTime(dateObj => dateObj ? new Date(dateObj.getTime() + 1000) : undefined)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [fromApi])

  return dateTime
}
