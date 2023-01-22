import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
import './main.scss'
export const PrivacyPolicyPage = () => {
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
        <div className='sub-section'>
          <h2 className='title'>Privacy Policy</h2>
          <h2>Last Updated</h2>
          <p>December 19, 2022</p>
        </div>
        <div className='sub-section'>
          <h4>
            Under the terms, "Algo" will refer to the University of
            Waterloo-based, early-stage startup (non-incorporated). "Algo" may
            be referred to as "we" in the terms.
          </h4>
        </div>
        <div className='sub-section'>
          <h2>Who is requesting Google user data?</h2>
          <p>
            Algo is a task management software with an automated schedule
            management system, where we request users' Google Calendar data for
            our Scheduler Generator functionality. Our application does not
            obtain authorized client credentials, and we do not store any Google
            user data in our database.
          </p>
        </div>
        <div className='sub-section'>
          <h2>What data are we requesting?</h2>
          <p>
            The Google user data we request is exclusively confined to Google
            Calendar data (sensitive scope name: "./auth/calendar"). The types
            of Google Calendar data requested are calendar events
            (create/read/update/delete), calendars (create/read), and timezone
            (read). We do not transfer/sell any requested data. We do not store
            any requested data in an internal database. We do not allow humans
            to read requested data. We are only requesting the minimum data
            necessary for our product's Schedule Generator feature.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Why are we requesting Google user data?</h2>
          <p>
            The use case of the requested Google user data is for the Scheule
            Generator feature. The Schedule Generator feature fetches users'
            Google Calendar events to identify empty time ranges throughout the
            day. Using this data, the Schedule Generator allocates time blocks
            for the user-inputted tasks in the Algo platform (not related to the
            Google Calendar tasks) in the form of events in the user's Google
            Calendar. When the user first uses the Schedule Generator feature,
            it creates a new calendar called "Algo" in the user's Google
            Calendar to hold all the allocated time blocks from the Algo
            platform. The Schedule Generator uses the user's timezone data from
            the user's Google Calendar to adjust the time range of each
            allocated event accordingly.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Google Calendar API Access</h2>
          <p>
            All-access to user's Google Calendar data is done according to the
            specified guideline in Google's Developer Page.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Google APIs Terms of Service Agreements</h2>
          <p>
            We, Algo, agree that our application accesses Google API Services in
            accordance with the Google APIs Terms of Service.
          </p>
        </div>
        <div className='sub-section'>
          <p>
            We, Algo, have read all conditions listed in the Google APIs Terms
            of Service, and declare that we meet all the requirements listed in
            the Google APIs Terms of Services.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Platform</h2>
          <p>Web Browser</p>
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
