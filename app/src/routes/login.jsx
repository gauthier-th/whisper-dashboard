import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../redux/actions'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const accessToken = useSelector((state) => state.accessToken)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const usernameInput = useRef(null)
  const passwordInput = useRef(null)

  async function sendLogin() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      dispatch(login({ accessToken: data.token, user: data.user }))
      toast.success('Login successful!')
    }
    catch {
      toast.error('Invalid username or password')
    }
  }

  useEffect(() => {
    if (accessToken) {
      navigate('/')
    }
  }, [accessToken, navigate])

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <h1 className="text-3xl">Whisper Dashboard</h1>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="w-96 max-w-full">
          <label className="input-label" htmlFor="username">
            Username
          </label>
          <input
            ref={usernameInput}
            className="input-field"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && passwordInput.current.focus()}
          />
        </div>
        <div className="w-96 max-w-full">
          <label className="input-label" htmlFor="password">
            Password
          </label>
          <input
            ref={passwordInput}
            className="input-field"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendLogin()}
          />
        </div>
        <button className="button w-24 max-w-full" onClick={() => sendLogin()}>
          Login
        </button>
      </div>
    </div>
  )
}

export default Login