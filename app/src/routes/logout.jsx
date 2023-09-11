import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/actions'

function Logout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(logout())
    navigate('/login')
  }, [dispatch, navigate]);

  return (
    <>
      <h1>Vite + React</h1>
    </>
  )
}

export default Logout
