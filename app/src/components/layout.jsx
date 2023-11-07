import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Outlet, Link } from 'react-router-dom'
import { logout } from '../redux/actions'

function Layout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const accessToken = useSelector((state) => state.accessToken)
  const user = useSelector((state) => state.user)

  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
    }
    else {
      const decodedToken = parseJwt(accessToken)
      if (Date.now() > decodedToken.exp * 1000) {
        navigate('/login')
        dispatch(logout())
      }
    }
  }, [navigate, accessToken, dispatch])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between px-4 py-1">
        <Link to="/">
          <h1 className="text-3xl">Whisper Dashboard</h1>
        </Link>
        {accessToken && (
          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <Link to="/admin" className="underline opacity-100 hover:opacity-80 transition-opacity">
                Admin panel
              </Link>
            )}
            <Link to="/account" className="underline opacity-100 hover:opacity-80 transition-opacity">
              Edit profile
            </Link>
            <Link to="/logout" className="underline opacity-100 hover:opacity-80 transition-opacity">
              Logout
            </Link>
          </div>
        )}
      </div>
      <div className="mt-4 flex-1 flex flex-col py-2 px-4">
        <Outlet />
      </div>
      <footer className="flex flex-col items-center py-2">
        <a
          href="https://github.com/gauthier-th/whisper-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="italic"
        >
          Created by <span className="text-blue-400">gauthier-th</span>
        </a>
      </footer>
    </div>
  )
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

export default Layout