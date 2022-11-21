import './styles/main.scss'
import './styles/light.scss'

export const TimeToggler = ({ time, changeTime, isHour, timeRangeTypeVal }) => {
  return (
    <div className='display-row'>
      <h3
        className={`reg-left-margin time-field${
          isHour ? '__hour' : '__minute'
        }`}
      >
        {!isHour && ':'} {time}
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
