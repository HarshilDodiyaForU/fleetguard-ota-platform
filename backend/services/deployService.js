const supabase = require('../config/supabaseClient')

const VALID_STRATEGIES = ['canary', 'rolling', 'immediate']

/** Keeps strategy on Socket.IO payloads (not stored in DB). */
const strategyByDeploymentId = new Map()

function normalizeVersion(version) {
  const v = version != null ? String(version).trim() : ''
  return v || 'unknown'
}

function buildDeploymentRow(version) {
  return {
    version: normalizeVersion(version),
    status: 'in_progress',
    progress: Math.floor(Math.random() * 45) + 35,
  }
}

function validateStrategy(strategy) {
  if (!VALID_STRATEGIES.includes(strategy)) {
    const error = new Error(`Invalid strategy. Expected one of: ${VALID_STRATEGIES.join(', ')}`)
    error.statusCode = 400
    throw error
  }
}

async function createDeploymentRecord(strategy, version = null) {
  validateStrategy(strategy)
  const row = buildDeploymentRow(version)
  const { data, error } = await supabase.from('deployments').insert([row]).select('*').single()

  if (error) throw error
  strategyByDeploymentId.set(data.id, strategy)
  return data
}

function withStrategyPayload(row) {
  if (!row) return row
  const strategy = strategyByDeploymentId.get(row.id)
  return strategy ? { ...row, strategy } : { ...row }
}

async function updateDeploymentProgress(id, progress, status = 'in_progress') {
  const { data, error } = await supabase
    .from('deployments')
    .update({ progress, status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

async function listRecentDeployments(limit = 20) {
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

function simulateDeploymentProgress(deploymentId) {
  const timer = setInterval(async () => {
    try {
      const { data: current, error: readError } = await supabase
        .from('deployments')
        .select('*')
        .eq('id', deploymentId)
        .single()

      if (readError || !current) {
        clearInterval(timer)
        return
      }

      const nextProgress = Math.min(
        100,
        Number(current.progress || 0) + Math.floor(Math.random() * 15 + 7),
      )
      const nextStatus = nextProgress >= 100 ? 'completed' : 'in_progress'

      const updated = await updateDeploymentProgress(deploymentId, nextProgress, nextStatus)

      if (global.io) {
        global.io.emit('deploy:update', withStrategyPayload(updated))
      }

      if (nextStatus !== 'in_progress') {
        strategyByDeploymentId.delete(deploymentId)
        clearInterval(timer)
      }
    } catch {
      clearInterval(timer)
    }
  }, 3000)
}

module.exports = {
  createDeploymentRecord,
  simulateDeploymentProgress,
  listRecentDeployments,
  withStrategyPayload,
}
