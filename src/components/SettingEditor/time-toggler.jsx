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
      <h3
        className={`reg-left-margin time-field${
          isHour ? '__hour' : '__minute'
        }`}
      >
        
        {!isHour && ':'} {handleAmPm(time)}
      </h3>
      <div className='display-col'>
        <i
          class='arrow up'
          onClick={() => changeTime(true, isHour, timeRangeTypeVal)}
        />
        <i
          class='arrow down'
          onClick={() => changeTime(false, isHour, timeRangeTypeVal)}
        />
      </div>
    </div>
  )
}
