import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../datepicker.scss'

export const MyDatePicker = ({ date, setDate }) => {
  return (
    <DatePicker
      className='my-datepicker'
      showIcon
      selected={date}
      dateFormat='dd/MM/yyyy'
      onChange={(newDate) => {
        const newDateObj = new Date(newDate)
        const newYear = newDateObj.getFullYear()
        const newMonth = newDateObj.getMonth()
        const newDay = newDateObj.getDate()

        const updatedDate = new Date(date)
        updatedDate.setFullYear(newYear)
        updatedDate.setMonth(newMonth)
        updatedDate.setDate(newDay)

        setDate(updatedDate)
      }}
    />
  )
}
