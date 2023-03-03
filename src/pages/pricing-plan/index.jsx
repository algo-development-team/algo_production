import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
import './main.scss'
import DescriptionBox from './description-box'
import PriceDescriptionBox from './description-price-box'
import { useResponsiveSizes } from 'hooks'

export const PricingPlanPage = () => {
  const { sizes } = useResponsiveSizes()

  return (
    <main className='landing-page'>
      <header className='intro__header'>
        <nav className='intro__nav'>
          <div className='intro__nav--group'>
            <div className='nav-logo'>
              <Logo className='logo__desktop' />
              <LogoMobile className='logo__mobile' />
            </div>
            <div className='intro__nav--group__wrapper'>
              <Link className='intro__nav--item intro__nav--link' to='/'>
                Home
              </Link>
              <Link
                className='intro__nav--item intro__nav--link'
                to='/privacy-policy'
              >
                Privacy Policy
              </Link>
              <Link
                className='intro__nav--item intro__nav--link'
                to='/terms-of-service'
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <div className='intro__nav--group'>
            <div className='intro__nav--group__wrapper'>
              <Link className='intro__nav--item intro__nav--link' to='/signin'>
                Log in
              </Link>
              <Link className='intro__nav--item intro__nav--link' to='/signup'>
                Sign up
              </Link>
              <Link
                className='intro__nav--item intro__nav--link'
                to='/pricing-plan'
              >
                Pricing
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className='pricing-page'>
        <div
          className='pricing-page__container'
          style={{
            display: 'flex',
            flexDirection: sizes.smallPhone ? 'column' : 'row',
            columnGap: '20px',
          }}
        >
          <div className='pricing-page__frame'>
            <div className='pricing-page__content'>
              <PriceDescriptionBox
                title='Free-Trial Plan'
                price='$0'
                price_description='For 2-Month'
                description=''
              />
            </div>
          </div>

          <div className='pricing-page__frame'>
            <div className='pricing-page__content'>
              <PriceDescriptionBox
                title='Basic Plan'
                price='$12'
                price_description='Per Month'
                description=''
              />
            </div>
          </div>
        </div>
      </div>

      <section className='section__content'>
        <DescriptionBox
          title='Which plan is right for me?'
          description="The schedule generator algorithm reads events in your Google
             Calendar to identify empty time ranges, and it assigns your tasks
             from Algo as time blocks into your Google Calendar according to the
             task's relative priority and your preference in the setting. The schedule generator algorithm schedules both your work and
             personal tasks."
        />
      </section>
    </main>
  )
}
