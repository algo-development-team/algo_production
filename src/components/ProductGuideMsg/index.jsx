import { useThemeContextValue } from 'context'
import { useState } from 'react'
import { Page1 } from './page1'
import './styles/main.scss'
import './styles/light.scss'

const LAST_PAGE = 3

export const ProductGuideMsg = ({ closeOverlay }) => {
  const { isLight } = useThemeContextValue()
  const [page, setPage] = useState(0) // 0: first page, 1: second page, ..., LAST_PAGE: last page

  const handleNext = () => {
    setPage(page + 1)
  }

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div className={'add-task__actions quick-add__actions'}>
        {page === 0 && <Page1 />}
        {page !== LAST_PAGE && (
          <button
            className=' action add-task__actions--add-task'
            type='button'
            onClick={() => handleNext()}
          >
            Next
          </button>
        )}
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
