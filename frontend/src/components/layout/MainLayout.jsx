import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRealtime } from '../../context/RealtimeContext'
import { useToastContext } from '../../context/ToastContext'
import { useDashboardData } from '../../hooks/useDashboardData'
import { useDeployment } from '../../hooks/useDeployment'
import { useFleetDevices } from '../../hooks/useFleetDevices'
import { useRiskReport } from '../../hooks/useRiskReport'
import { decorateDeviceList } from '../../utils/deviceDisplay'
import Header from './Header'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  fleet: 'Fleet',
  rollout: 'Rollout',
  risk: 'Risk',
  settings: 'Settings',
}

function pathToPage(pathname) {
  const segment = pathname.replace(/^\//, '').split('/')[0]
  if (segment && PAGE_TITLES[segment]) return segment
  return 'dashboard'
}

export default function MainLayout() {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const { liveDevices, liveDeployment, connectionStatus } = useRealtime()
  const { pushToast } = useToastContext()

  const activePage = pathToPage(pathname)

  const dashboard = useDashboardData({
    enabled: activePage === 'dashboard' || activePage === 'rollout',
    notifyError: pushToast,
  })
  const fleet = useFleetDevices({
    enabled: activePage === 'fleet',
    notifyError: pushToast,
  })
  const risk = useRiskReport({
    enabled: activePage === 'risk',
    notifyError: pushToast,
  })
  const deployment = useDeployment({
    notifyError: pushToast,
    notifySuccess: pushToast,
  })

  const mergedFleetDevices = useMemo(() => {
    if (liveDevices !== null) {
      return decorateDeviceList(liveDevices)
    }
    return fleet.devices
  }, [liveDevices, fleet.devices])

  const outletContext = useMemo(
    () => ({
      dashboard,
      fleet: { ...fleet, devices: mergedFleetDevices },
      risk,
      deployment,
      realtime: { liveDeployment, connectionStatus },
    }),
    [dashboard, fleet, mergedFleetDevices, risk, deployment, liveDeployment, connectionStatus],
  )

  return (
    <div className="min-h-screen bg-fleet-bg text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar onLogout={() => logout()} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Header
            title={PAGE_TITLES[activePage]}
            onLogout={() => logout()}
            connectionStatus={connectionStatus}
          />
          <section className="mt-6">
            <Outlet context={outletContext} />
          </section>
        </main>
      </div>
    </div>
  )
}
