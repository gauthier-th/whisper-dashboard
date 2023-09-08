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
  }, [navigate, accessToken])

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col">
      <Outlet />
    </div>
  )
}

export default Layout