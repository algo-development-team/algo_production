export const PreferenceSetter = ({
  selectedPreferences,
  preferences,
  setPreferences,
  type,
  title,
}) => {
  const getHourlyTimeRange = (i) => {
    if (i === 0) {
      return '12-1am'
    } else if (i < 12) {
      return `${i}-${i + 1}am`
    } else if (i === 12) {
      return '12-1pm'
    } else {
      return `${i - 12}-${i - 11}pm`
    }
  }

  const getOptions = (type) => {
    if (type === 'work') {
      return (
        <>
          <option value={0}>No Preference</option>
          <option value={1}>Hard Work</option>
          <option value={2}>Easy Work</option>
        </>
      )
    } else if (type === 'personal') {
      return (
        <>
          <option value={0}>Personal Task</option>
          <option value={1}>Rest</option>
        </>
      )
    }
  }

  const getTextColor = (type, preference) => {
    if (type === 'work') {
      return preference === 0
        ? '__none'
        : preference === 1
        ? '__orange'
        : '__green'
    } else if (type === 'personal') {
      return preference === 0 ? '__green' : '__none'
    }
  }

  return (
    <>
      <h4>{title}</h4>
      <div>
        {selectedPreferences.map(({ preference, hour }) => (
          <div className='display-row time-period__row'>
            <p className='time-period__label'>{getHourlyTimeRange(hour)}</p>
            <select
              value={preference}
              className={`select-preference text-color${getTextColor(
                type,
                preference,
              )}`}
              onChange={(e) => {
                const newPreferences = [...preferences]
                newPreferences[hour] = parseInt(e.target.value)
                setPreferences(newPreferences)
              }}
            >
              {getOptions(type)}
            </select>
          </div>
        ))}
      </div>
    </>
  )
}
