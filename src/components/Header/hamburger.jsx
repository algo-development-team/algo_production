import { ReactComponent as HamburgerIcon } from 'assets/svg/hamburger.svg'

export const HamburgerButton = (props) => {
  return (
    <div
      role='button'
      onClick={props.onClick}
      className='hamburger_button header-clickable'
      style={{ marginTop: '3px' }}
    >
      <HamburgerIcon height='24px' width='24px' strokeWidth={0.1} />
    </div>
  )
}
