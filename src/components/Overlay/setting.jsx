import { SettingEditor } from 'components/SettingEditor'

export const Setting = ({ closeOverlay }) => {
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
        <SettingEditor closeOverlay={closeOverlay} />
      </div>
    </div>
  )
}
