import { ReactComponent as HamburgerIcon } from 'assets/svg/hamburger.svg'
import { useResponsiveSizes } from 'hooks'

export const HamburgerButton = (props) => {
  const { sizes } = useResponsiveSizes()

  return (
    <div
      role='button'
      onClick={props.onClick}
      className='hamburger_button header-clickable'
      style={{ marginTop: '3px' }}
    >
      <HamburgerIcon height={24} width={24} strokeWidth={0.1} />
    </div>
  )
}
