import './styles/main.scss'
import './styles/light.scss'

export const TimeToggler = ({ time, changeTime, isHour, timeRangeTypeVal }) => {
  /*The is the Handle of the AM & PM */
  const handleAmPm = (hour) => {
    if (hour > 12) {
      return hour - 12
    } else if (hour === 0) {
      return 12
    } else {
      return hour
    }
  }

  return (
    <div className='display-row'>
      <p
        className={`reg-left-margin time-field${
          isHour ? '__hour' : '__minute'
        }`}
      >
        {!isHour && ':'} {isHour ? handleAmPm(time) : time}
      </p>
      <div className='display-col'>
        <i
          class='arrow-md up'
          onClick={() => changeTime(true, isHour, timeRangeTypeVal)}
        />
        <i
          class='arrow-md down'
          onClick={() => changeTime(false, isHour, timeRangeTypeVal)}
        />
      </div>
    </div>
  )
}
