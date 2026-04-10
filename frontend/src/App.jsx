import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useOutletContext } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import PageSpinner from './components/ui/PageSpinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Fleet = lazy(() => import('./pages/Fleet'))
const Rollout = lazy(() => import('./pages/Rollout'))
const Risk = lazy(() => import('./pages/Risk'))
const Settings = lazy(() => import('./pages/Settings'))

function PublicGate({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function DashboardView() {
  const { dashboard } = useOutletContext()
  return (
    <Dashboard
      isLoading={dashboard.isLoading}
      kpis={dashboard.kpis}
      successTrend={dashboard.successTrend}
      distribution={dashboard.distribution}
      activityFeed={dashboard.activityFeed}
    />
  )
}

function FleetView() {
  const { fleet } = useOutletContext()
  return <Fleet devices={fleet.devices} isLoading={fleet.isLoading} />
}

function RolloutView() {
  const { dashboard, deployment, realtime } = useOutletContext()
  return (
    <Rollout
      activeDevices={dashboard.kpis.totalDevices}
      onDeploy={deployment.deploy}
      isSubmitting={deployment.isSubmitting}
      liveDeployment={realtime.liveDeployment}
      connectionStatus={realtime.connectionStatus}
    />
  )
}

function RiskView() {
  const { risk } = useOutletContext()
  return <Risk risk={risk.risk} isLoading={risk.isLoading} loadError={risk.loadError} />
}

function SettingsView() {
  return <Settings />
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicGate>
            <Login />
          </PublicGate>
        }
      />
      <Route
        path="/register"
        element={
          <PublicGate>
            <Register />
          </PublicGate>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageSpinner />}>
                <DashboardView />
              </Suspense>
            }
          />
          <Route
            path="fleet"
            element={
              <Suspense fallback={<PageSpinner />}>
                <FleetView />
              </Suspense>
            }
          />
          <Route
            path="rollout"
            element={
              <Suspense fallback={<PageSpinner />}>
                <RolloutView />
              </Suspense>
            }
          />
          <Route
            path="risk"
            element={
              <Suspense fallback={<PageSpinner />}>
                <RiskView />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageSpinner />}>
                <SettingsView />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
