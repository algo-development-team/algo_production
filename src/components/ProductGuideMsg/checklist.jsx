import { ReactComponent as HomeIcon } from 'assets/svg/home.svg'

const ScheduleButton = ({ label }) => {
  return <button className='schedule__btn'>{label}</button>
}

export const Checklist = () => {
  return (
    <div>
      <h2>Checklist</h2>
      <h4>
        You can navigate to your Checklist by clicking on{' '}
        <HomeIcon strokeWidth='.1' /> at the top or using the sidebar.
      </h4>
      <h4>
        Your checklist will be automatically generated based on your schedule
        when you click on
      </h4>
      <ScheduleButton label='Create Daily Schedule' />
    </div>
  )
}
