import { ReactComponent as HamburgerIcon } from 'assets/svg/hamburger.svg'

export const Navigation = () => {
  return (
    <div>
      <h2>Navigation</h2>
      <h4>You can navigate the application using the sidebar.</h4>
      <h4>
        Click <HamburgerIcon strokeWidth={0.1} /> to open and close the sidebar.
      </h4>
    </div>
  )
}
