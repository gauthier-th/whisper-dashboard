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
      <div className="flex justify-between">
        <h1 className="text-3xl">Whisper Dashboard</h1>
        {accessToken && (
          <button
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            onClick={() => navigate('/logout')}
          >
            Logout
          </button>
        )}
      </div>
      <div className="mt-2 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout