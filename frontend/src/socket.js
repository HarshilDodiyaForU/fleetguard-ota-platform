import { io } from 'socket.io-client'
import { getSocketUrl } from './config/api'

const socketUrl = getSocketUrl()

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
})

export default socket
