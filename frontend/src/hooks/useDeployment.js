import { useState } from 'react'
import { startDeployment } from '../api/fleetguardApi'

export function useDeployment({ notifyError, notifySuccess } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deploy = async ({ strategy, firmwareVersion } = {}) => {
    const strat = typeof strategy === 'string' ? strategy : ''
    try {
      setIsSubmitting(true)
      const data = await startDeployment(strat.toLowerCase(), firmwareVersion)
      notifySuccess?.({
        title: 'Deployment started',
        description: `Deployment ${data.deploymentId} is now in progress.`,
      })
      return data
    } catch (error) {
      notifyError?.({
        title: 'Deployment failed',
        description: error?.response?.data?.message || 'Unable to start deployment.',
      })
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return { deploy, isSubmitting }
}
