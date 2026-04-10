import client from './client'

const authConfig = { skipGlobalErrorToast: true }

export async function loginUser(data) {
  const res = await client.post('/auth/login', data, authConfig)
  return res.data
}

export async function registerUser(data) {
  const res = await client.post('/auth/register', data, authConfig)
  return res.data
}

export async function fetchStats() {
  const response = await client.get('/stats')
  return response.data.data
}

export async function fetchDevices() {
  const response = await client.get('/devices')
  return response.data.data
}

export async function fetchRisk() {
  const response = await client.get('/risk')
  return response.data.data
}

export async function startDeployment(strategy, firmwareVersion) {
  const response = await client.post('/deploy', { strategy, firmwareVersion })
  return response.data.data
}

export async function fetchDeploymentHistory() {
  const response = await client.get('/deploy/history')
  return response.data.data
}
