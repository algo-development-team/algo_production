import illustration from 'assets/svg/main-background.webp'
import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
import './main.scss'
export const LandingPage = () => {
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
            </div>
          </div>
        </nav>
      </header>

      <section className='section__intro'>
        <div className='intro__hero'>
          <h1 className='hero-text'>
            AI Assistant to
            <br />
            schedule all TODOS in life.
          </h1>
          <h2 className='hero-text__sub'>
            The first AI assistant to provide personalized scheduling for all
            your tasks.
          </h2>
          <Link to='/signin' className='intro__hero--cta'>
            Start for free
          </Link>
        </div>
        <img
          src={illustration}
          className='intro__hero--illustration-1'
          alt=''
          width={1256}
        />
      </section>

      <section className='section__content'>
        <div className='sub-section'>
          <h2>What is Algo?</h2>
          <p>
            Algo is a next-generation task management platform that
            automatically generates schedules for you.
          </p>
        </div>
        <div className='sub-section'>
          <p>
            Using Algo for your schedule management can dramatically boost your
            productivity in both work and personal life, resulting in better
            work performance and improved work-life balance.
          </p>
        </div>
        <div className='sub-section'>
          <h2>How do you use it?</h2>
          <p>
            You simply need to add your tasks and click the "Generate Schedule"
            button, and our schedule generator algorithm will create a daily
            schedule in your Google Calendar within 2 seconds.
          </p>
        </div>
        <div className='sub-section'>
          <h2>How does it work?</h2>
          <p>
            The schedule generator algorithm reads events in your Google
            Calendar to identify empty time ranges, and it assigns your tasks
            from Algo as time blocks into your Google Calendar according to the
            task's relative priority and your preference in the setting.
          </p>
        </div>
        <div className='sub-section'>
          <p>
            The schedule generator algorithm schedules both your work and
            personal tasks.
          </p>
        </div>
        <div className='sub-section'>
          <h2>Features</h2>
          <ul>
            <li>- Checklist</li>
            <li>- Task Projects</li>
            <li>- Kanban Board</li>
            <li>- Schedule Generator</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
