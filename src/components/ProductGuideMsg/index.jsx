import { useThemeContextValue } from 'context'
import { ReactComponent as GoogleCalendarIcon } from 'assets/svg/google-calendar.svg'
import { useState } from 'react'
import './styles/main.scss'
import './styles/light.scss'

export const ProductGuideMsg = ({ closeOverlay }) => {
  const { isLight } = useThemeContextValue()
  const [page, setPage] = useState(0) // 0: first page, 1: second page, ..., n: last page

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div className={'add-task__actions quick-add__actions'}>
        <h1>Welcome to Algo!</h1>
        <p>This is page 1</p>
        <button className=' action add-task__actions--add-task' type='button'>
          Next
        </button>
        <button
          className={` action  ${
            isLight ? 'action__cancel' : 'action__cancel--dark'
          }`}
          onClick={(event) => closeOverlay()}
        >
          Close
        </button>
      </div>
    </div>
  )
}
