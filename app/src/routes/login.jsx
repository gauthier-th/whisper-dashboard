import { useState } from 'react'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function login() {
    console.log({ username, password })
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <h1 className="text-3xl">Whisper Dashboard</h1>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="w-96 max-w-full">
          <label className="input-label" htmlFor="username">
            Username
          </label>
          <input
            className="input-field"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="w-96 max-w-full">
          <label className="input-label" htmlFor="password">
            Password
          </label>
          <input
            className="input-field"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="button w-24 max-w-full" onClick={() => login()}>
          Login
        </button>
      </div>
    </div>
  )
}

export default Login