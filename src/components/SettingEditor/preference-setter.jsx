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
          <option value={0}>Urgent Work (ex: Work Due Today)</option>
          <option value={1}>Focus Work (ex: Coding)</option>
          <option value={2}>Easy Work (ex: Check Emails)</option>
        </>
      )
    } else if (type === 'personal') {
      return (
        <>
          <option value={0}>Personal Work</option>
          <option value={1}>No Work</option>
        </>
      )
    }
  }

  const getTextColor = (type, preference) => {
    if (type === 'work') {
      return preference === 0
        ? '__urgent'
        : preference === 1
        ? '__deep'
        : '__shallow'
    } else if (type === 'personal') {
      return preference === 0 ? '__personal' : '__no-work'
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
