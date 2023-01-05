import { ProductGuideMsg } from 'components/ProductGuideMsg'

export const ProductGuide = ({ closeOverlay }) => {
  return (
    <div className='option__overlay' onClick={(event) => closeOverlay(event)}>
      <div className='quick-add-task__wrapper'>
        <ProductGuideMsg closeOverlay={closeOverlay} />
      </div>
    </div>
  )
}
