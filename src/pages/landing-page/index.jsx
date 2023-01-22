import illustration from 'assets/svg/main-background.webp'
import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
import './feature-table.css'
import './main.scss'
import DescriptionBoxRight from './description-box-right'
import DescriptionBoxLeft from './description-box-left'
import algoScreenshot from 'assets/png/algo_screenshot.png'
import inboxScreenshot from 'assets/png/Inbox.png'
import calendar from 'assets/png/calendar.png'
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
              <Link
                className='intro__nav--item intro__nav--link' to='/pricing-plan'>
                Pricing
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
           <DescriptionBoxRight
             title = "What is Algo?"
             imagesrc = {algoScreenshot} 
             description = " Algo is a next-generation task management platform that
              automatically generates schedules for you.Using Algo for your schedule management can dramatically boost your
              productivity in both work and personal life, resulting in better
              work performance and improved work-life balance."  />

           <DescriptionBoxLeft
             title = "How do you use it?"
             imagesrc = {calendar}
             description = 'You simply need to add your tasks and click the "Generate Schedule"
              button, and our schedule generator algorithm will create a daily
              schedule in your Google Calendar within 2 seconds.'  />

           <DescriptionBoxRight
             title = "How does it work?"
             imagesrc = {inboxScreenshot}
             description = "The schedule generator algorithm reads events in your Google
             Calendar to identify empty time ranges, and it assigns your tasks
             from Algo as time blocks into your Google Calendar according to the
             task's relative priority and your preference in the setting. The schedule generator algorithm schedules both your work and
             personal tasks."  />
        
        <h1 style={{ textAlign: "center", fontSize: "250%" }}>Features</h1>

        <div className='sub-section'>
        <div class="wrapper">
        <h2 class="box1" text-align="centre">✅ Keep track of your tasks using "Checklist".</h2>
        <h2 class="box2" text-align="centre">✅ Manage both work and personal tasks using "Projects".</h2>
        <h2 class="box3" text-align="centre">✅ Organize your task using "Kanban Board".</h2>
        <h2 class="box4" text-align="centre">✅ Generate your daily schedule in 2 seconds using "Schedule Generator".</h2>
        <h2 class="box5" text-align="centre">✅ Personalize the Schedule Generator using "Setting".</h2>
        <h2 class="box6" text-align="centre">✅ Add tasks with two clicks using "Quick Task Add".</h2>
        <h1 class="box7" style={{ textAlign: "center", fontSize: "250%" }}>Upcoming Features</h1>
        <h2 class="box8" text-align="centre">🔜 Add team members to your projects.</h2>
        <h2 class="box9" text-align="centre">🔜 Optimize meeting booking.</h2>
        <h2 class="box10" text-align="centre">🔜 Automatically assign tasks to team-members.</h2>
        </div>
        </div>
      </section>
    </main>
  )
}
