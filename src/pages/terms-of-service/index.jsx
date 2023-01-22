import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
import './main.scss'
export const TermsOfServicePage = () => {
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
                className='intro__nav--item intro__nav--link' to='/pricing-plan'>
                Pricing
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section className='section__content'>
        <h2 className='title'>Terms of Service</h2>
        <div className='sub-section'>
          <h2>Last Updated</h2>
          <p>December 19, 2022</p>
        </div>
        <div className='sub-section'>
          <p>
            These terms and conditions (the "Terms and Conditions") govern the
            use of https://algoai.web.app (the "Site"). This Site is owned and
            operated by Algo. This Site is a task management app.
          </p>
        </div>
        <div className='sub-section'>
          <p>
            By using this Site, you indicate that you have read and understand
            these Terms and Conditions and agree to abide by them at all times.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <h2>Intellectual Property </h2>
          <p>
            All content published and made available on our Site is the property
            of Algo and the Site's creators. This includes, but is not limited
            to images, text, logos, documents, downloadable files and anything
            that contributes to the composition of our Site.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <h2>Accounts</h2>
          <p>
            When you create an account on our Site, you agree to the following:
            1. You are solely responsible for your account and the security and
            privacy of your account, including passwords or sensitive
            information attached to that account; and 2. All personal
            information you provide to us through your account is up to date,
            accurate, and truthful and that you will update your personal
            information if it changes.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <p>
            We reserve the right to suspend or terminate your account if you are
            using our Site illegally or if you violate these Terms and
            Conditions.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Limitation of Liability </h2>
          <p>
            Algo and our directors, officers, agents, employees, subsidiaries,
            and affiliates will not be liable for any actions, claims, losses,
            damages, liabilities and expenses including legal fees from your use
            of the Site.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <h2>Indemnity</h2>
          <p>
            Except where prohibited by law, by using this Site you indemnify and
            hold harmless Algo and our directors, officers, agents, employees,
            subsidiaries, and affiliates from any actions, claims, losses,
            damages, liabilities and expenses including legal fees arising out
            of your use of our Site or your violation of these Terms and
            Conditions.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <h2>Applicable Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of the Province
            of Ontario.{' '}
          </p>
        </div>
        <div className='sub-section'>
          <h2>Severability</h2>
          <p>
            If at any time any of the provisions set forth in these Terms and
            Conditions are found to be inconsistent or invalid under applicable
            laws, those provisions will be deemed void and will be removed from
            these Terms and Conditions. All other provisions will not be
            affected by the removal and the rest of these Terms and Conditions
            will still be considered valid.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Changes</h2>
          <p>
            These Terms and Conditions may be amended from time to time in order
            to maintain compliance with the law and to reflect any changes to
            the way we operate our Site and the way we expect users to behave on
            our Site. We will notify users by email of changes to these Terms
            and Conditions or post a notice on our Site.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Contact Details</h2>
          <p>
            Please contact us if you have any questions or concerns. Our contact
            details are as follows:
          </p>
        </div>
        <div className='sub-section'>
          <p>Email: techandy42@gmail.com</p>
        </div>
      </section>
    </main>
  )
}
