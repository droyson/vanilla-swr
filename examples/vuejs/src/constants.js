export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const fetchTime = async (region) => {
  const { datetime } = await fetch(`${window.location.protocol}//worldtimeapi.org/api/timezone/${region}`).then(res => res.json())
  const tzIndex = datetime.search(/(-|\+)\d{2}:\d{2}/)
  return new Date(datetime.substring(0, tzIndex))
}

export function pad0 (value) {
  return value.toString().padStart(2, '0')
}
