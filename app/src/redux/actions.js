import { initState } from './reducers'

const actions = {
  SETACCESSTOKEN: 'SETACCESSTOKEN',
  SETUSER: 'SETUSER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
}

export function setAccessToken(accessToken) {
  return { type: actions.SETACCESSTOKEN, accessToken }
}

export function setUser(user) {
  return { type: actions.SETUSER, user }
}

export function login({ accessToken, user }) {
  return { type: actions.LOGIN, accessToken, user }
}

export function logout() {
  const { accessToken, user } = initState
  return { type: actions.LOGOUT, accessToken, user }
}

export default actions