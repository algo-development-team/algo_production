import illustration from 'assets/svg/main-background.webp'
import { ReactComponent as LogoMobile } from 'assets/svg/new-logo-mobile.svg'
import { ReactComponent as Logo } from 'assets/svg/new-logo.svg'
import { Link } from 'react-router-dom'
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
             imagesrc = {algoScreenshot} 
             description = " Algo is a next-generation task management platform that
              automatically generates schedules for you.Using Algo for your schedule management can dramatically boost your
              productivity in both work and personal life, resulting in better
              work performance and improved work-life balance."  />

           <DescriptionBoxLeft
             imagesrc = {calendar}
             description = 'You simply need to add your tasks and click the "Generate Schedule"
              button, and our schedule generator algorithm will create a daily
              schedule in your Google Calendar within 2 seconds.'  />

           <DescriptionBoxRight
             imagesrc = {inboxScreenshot}
             description = "The schedule generator algorithm reads events in your Google
             Calendar to identify empty time ranges, and it assigns your tasks
             from Algo as time blocks into your Google Calendar according to the
             task's relative priority and your preference in the setting. The schedule generator algorithm schedules both your work and
             personal tasks."  />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <div style={{  width: "650px", height: "390px", padding: "25px", border: "4px solid #0504aa", borderRadius: "20px", justifyContent: "center"}}>
            <h1 style={{ textAlign: "center", fontSize: "30px" }}>Features</h1>
            <ul style={{ fontSize: "18px" , font: "500 100%/1.5 system-ui"}}>
              <li>✅ Keep track of your tasks using "Checklist".</li>
              <li>✅ Manage both work and personal tasks using "Projects".</li>
              <li>✅ Organize your task using "Kanban Board".</li>
              <li>✅ Generate your daily schedule in 2 seconds using "Schedule Generator".</li>
              <li>✅ Personalize the Schedule Generator using "Setting".</li>
              <li>✅ Add tasks with two clicks using "Quick Task Add".</li>
              <li>🔜 Add team members to your projects.</li>
              <li>🔜 Optimize meeting booking.</li>
              <li>🔜 Automatically assign tasks to team-members.</li>
            </ul>
          </div>
        </div>
        <br></br>
        <br></br>
        {/* <h1 style={{ textAlign: "center", fontSize: "250%" }}>Pricing</h1> */}
      </section>
      {/* <div class="row row--center row--margin"style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
  <div class="col-md-4 col-sm-4 price-box price-box--purple">
    <div class="price-box__wrap">
      <div class="price-box__img"></div>
      <h1 class="price-box__title">
        Startup
      </h1>
      <p class="price-box__people">
        1 - 100 people
      </p>
      <h2 class="price-box__discount">
        <span class="price-box__dollar">$</span>49<span class="price-box__discount--light">/mo</span>
      </h2>
      <h3 class="price-box__price">
        $65/mo
      </h3>
      <p class="price-box__feat">
        Features
      </p>
      <ul class="price-box__list">
        <li class="price-box__list-el">1 License</li>
        <li class="price-box__list-el">24h helpcenter</li>
        <li class="price-box__list-el">No tasks limit</li>
        <li class="price-box__list-el">No contractors limit </li>
      </ul>
       <div class="price-box__btn">
      <a class="btn btn--purple btn--width">Start now</a>
    </div>
  </div>
  </div>

  <div class="col-md-4 col-sm-4 price-box price-box--violet">
  <div class="price-box__wrap">
      <div class="price-box__img"></div>
      <h1 class="price-box__title">
        Business
      </h1>
      <p class="price-box__people">
        100 - 500 people
      </p>
      <h2 class="price-box__discount">
      <span class="price-box__dollar">$</span>149<span class="price-box__discount--light">/mo</span>
      </h2>
      <h3 class="price-box__price">
        $225/mo
      </h3>
      <p class="price-box__feat">
        Features
      </p>
      <ul class="price-box__list">
        <li class="price-box__list-el">1 License</li>
        <li class="price-box__list-el">24h helpcenter</li>
        <li class="price-box__list-el">No tasks limit</li>
        <li class="price-box__list-el">No contractors limit </li>
      </ul>
      <div class="price-box__btn">
      <a class="btn btn--violet btn--width">Start now</a>
    </div>
  </div>
  </div>

  <div class="col-md-4 col-sm-4 price-box price-box--blue">
  <div class="price-box__wrap">
      <div class="price-box__img"></div>
      <h1 class="price-box__title">
        Corporate
      </h1>
      <p class="price-box__people">
        500+ people
      </p>
      <h2 class="price-box__discount">
      <span class="price-box__dollar">$</span>399<span class="price-box__discount--light">/mo</span>
      </h2>
      <h3 class="price-box__price">
        $499/mo
      </h3>
      <p class="price-box__feat">
        Features
      </p>
      <ul class="price-box__list">
        <li class="price-box__list-el">1 License</li>
        <li class="price-box__list-el">24h helpcenter</li>
        <li class="price-box__list-el">No tasks limit</li>
        <li class="price-box__list-el">No contractors limit </li>
      </ul>
    <div class="price-box__btn">
      <a class="btn btn--blue btn--width">Start now</a>
    </div>
  </div>
  </div>
  </div>
  <br/>
  <br/>
  <br/>
  <br/> */}

    </main>
  )
}
