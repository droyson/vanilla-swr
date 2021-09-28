import { useCallback, useEffect, useRef, useState } from 'react';
import SWR from 'vanilla-swr'
import './App.css';
import { Clock1 } from './clocks/Clock1';
import { Clock2 } from './clocks/Clock2';
import { fetchTime } from './constants';

function App() {
  const [timezones, setTimezones] = useState([])
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata')
  const [fromApi, setFromApi] = useState(false)
  const [observable, setObservable] = useState(null)

  // useRef to maintain the updated value of selectedTimezone
  const currentRegion = useRef(selectedTimezone)
  useEffect(() => {
    currentRegion.current = selectedTimezone
  }, [selectedTimezone])
  // useCallback with ref to get the same instance of callback
  const getSelectedTz = useCallback(() => {
    return currentRegion.current
  }, [currentRegion])

  // set observable every time getSelectedTz changes
  useEffect(() => {
    setObservable(SWR(getSelectedTz, fetchTime))
  }, [getSelectedTz])

  useEffect(() => { 
    observable?.mutate({
      refreshInterval: fromApi ? 1000 : 0
    })
  }, [selectedTimezone, fromApi, observable])

  useEffect(() => {
    async function fetchTimezones () {
      const tzs = await fetch(`${window.location.protocol}//worldtimeapi.org/api/timezone`).then(res => res.json())
      setTimezones(tzs)
    }
    fetchTimezones()
  }, [])

  function handleTzChange (event) {
    setSelectedTimezone(event.target.value)
  }

  function handleApiChange (event) {
    const isFromApi = event.target.checked
    setFromApi(isFromApi)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Clock App</h1>
      </header>
      <main>
        <div className="picker-container">
          <div>
            <span>Region:</span>
            <select value={selectedTimezone} onChange={handleTzChange}>
              {timezones.map(tz => (<option value={tz} key={tz}>{tz}</option>))}
            </select>
          </div>
          <div>
            <input type="checkbox" id="api" checked={fromApi} onChange={handleApiChange}></input>
            <label htmlFor="api">Update only via API</label>
          </div>
        </div>
        <div className="clocks">
          <Clock1 observable={observable} fromApi={fromApi}/>
          <Clock2 observable={observable} fromApi={fromApi}/>
        </div>
      </main>
    </div>
  );
}

export default App;
