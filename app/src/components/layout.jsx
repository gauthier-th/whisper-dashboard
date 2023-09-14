import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Outlet } from 'react-router-dom'

function Layout() {
  const navigate = useNavigate()
  const accessToken = useSelector((state) => state.accessToken)

  useEffect(() => {
    if (!accessToken) {
      console.log('redirecting to login')
      navigate('/login')
    }
    console.log({ accessToken })
  }, [navigate, accessToken])

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col">
      <div className="flex justify-between px-2 py-1">
        <h1 className="text-3xl">Whisper Dashboard</h1>
        {accessToken && (
          <button
            className="button button-secondary"
            onClick={() => navigate('/logout')}
          >
            Logout
          </button>
        )}
      </div>
      <div className="mt-4 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout