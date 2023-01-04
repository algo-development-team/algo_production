import { useThemeContextValue } from 'context'
import { useState } from 'react'
import { Page1 } from './page1'
import { Page2 } from './page2'
import { Page3 } from './page3'
import { Page4 } from './page4'
import { Page5 } from './page5'
import { Page6 } from './page6'
import { Page7 } from './page7'
import './styles/main.scss'
import './styles/light.scss'

export const ProductGuideMsg = ({ closeOverlay }) => {
  const LAST_PAGE = 6
  const { isLight } = useThemeContextValue()
  const [page, setPage] = useState(0) // 0: first page, 1: second page, ..., LAST_PAGE: last page

  const handleNext = () => {
    setPage(page + 1)
  }

  const getPageComponent = () => {
    switch (page) {
      case 0:
        return <Page1 />
      case 1:
        return <Page2 />
      case 2:
        return <Page3 />
      case 3:
        return <Page4 />
      case 4:
        return <Page5 />
      case 5:
        return <Page6 />
      case 6:
        return <Page7 />
      default:
        return <Page1 />
    }
  }

  return (
    <div
      className={'add-task__wrapper quick-add__wrapper'}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <div className={'add-task__actions quick-add__actions'}>
        {getPageComponent()}
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
          {page === LAST_PAGE ? 'Close' : 'Skip'}
        </button>
      </div>
    </div>
  )
}
