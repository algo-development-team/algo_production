import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { ReactComponent as LogoSmall } from 'assets/svg/new-logo-small.svg'
import { Link } from 'react-router-dom'
import './main.scss'
import { PaymentForm } from './payment-form'

export const PaymentPage = () => { 

  
  return (

    <main className='payment-page'>

      <header className='intro__header'>
        <nav className='intro__nav'>
          <div className='intro__nav--group'>
            <div className='nav-logo'>
              <Logo className='logo__desktop' />
              <LogoMobile className='logo__mobile' />
            </div>
            <div className='intro__nav--group__wrapper'>
              <Link className='intro__nav--item intro__nav--link' to='/app/*'>
                Back
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className='payment-box'>
        <div className='payment-box__container'>
          <div className='payment-box__frame'>
            <div className='payment-box__wrapper'>
              <div className='payment-box__logo'>
                <Link to='/'>
                  <LogoSmall />
                </Link>
              </div>
              <div className='payment-page__content'>
                <PaymentForm />
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

  )
}
