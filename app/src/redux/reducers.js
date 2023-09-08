import actions from './actions'

export const initState = {
  accessToken: null,
  user: null,
}

export default function reducers(state = initState, action) {
  switch (action.type) {
    case actions.SETACCESSTOKEN:
      return { ...state, accessToken: action.accessToken }
    case actions.SETUSER:
      return { ...state, user: action.user }
    case actions.LOGIN:
      return { ...state, accessToken: action.accessToken, user: action.user }
    case actions.LOGOUT:
      return { ...state, accessToken: action.accessToken, user: action.user }
    default:
      return state
  }
}