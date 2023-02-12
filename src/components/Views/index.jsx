import { Content } from 'components/Content'
import { DashBoardRoutes } from 'components/AuthenticatedRoutes'
import { Layout } from 'components/Layout'
import { UnauthenticatedRoutes } from 'components/UnauthenticatedRoutes'
import { ProjectsContextProvider } from 'context'
import { AuthenticationPage } from 'pages/authentication'
import { LandingPage } from 'pages/landing-page'
import { PrivacyPolicyPage } from 'pages/privacy-policy-page'
import { Route, Routes } from 'react-router-dom'
import { TermsOfServicePage } from 'pages/terms-of-service'
import { PricingPlanPage } from 'pages/pricing-plan'
import { PaymentPage } from 'components/Payment'

export const Views = () => {
  return (
    <ProjectsContextProvider>
      <Routes>
        {/* Routes specified here will be redirected to '/' if they are accessed via link */}
        <Route element={<UnauthenticatedRoutes />}>
          <Route exact path='/' element={<LandingPage />} />
          <Route exact path='/signin' element={<AuthenticationPage />} />
          <Route exact path='/signup' element={<AuthenticationPage />} />
        </Route>

        <Route element={<DashBoardRoutes />}>
          <Route exact path={'/payment'} element={<PaymentPage />} />
          <Route exact path={'/app/*'} element={<Layout />}>
            <Route
              path={':defaultGroup'}
              element={<Content isDefaultGroup />}
            />
          </Route>

          <Route path={'/project/*'} element={<Layout />}>
            <Route path={':projectId'} element={<Content />} />
          </Route>

          <Route path={'/team/*'} element={<Layout />}>
            <Route path={':teamId'} element={<Content />} />
          </Route>
        </Route>

        {/* Routes specified here will not be redirected */}
        <Route exact path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route
          exact
          path='/terms-of-service'
          element={<TermsOfServicePage />}
        />
        <Route exact path='/pricing-plan' element={<PricingPlanPage />} />
        <Route path='/app' element={<>Page Not Found</>} />
        <Route path='*' element={<>Page Not Found</>} />
      </Routes>
    </ProjectsContextProvider>
  )
}
