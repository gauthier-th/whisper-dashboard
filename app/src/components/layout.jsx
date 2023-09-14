import { Fragment, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Outlet, Link } from 'react-router-dom'
import { Popover, Transition } from '@headlessui/react'
import { RiAccountCircleLine } from 'react-icons/ri'

function Layout() {
  const navigate = useNavigate()
  const accessToken = useSelector((state) => state.accessToken)
  const user = useSelector((state) => state.user)

  useEffect(() => {
    if (!accessToken) {
      console.log('redirecting to login')
      navigate('/login')
    }
  }, [navigate, accessToken])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between px-2 py-1">
        <Link to="/">
          <h1 className="text-3xl">Whisper Dashboard</h1>
        </Link>
        {accessToken && (
          <Popover>
            <Popover.Button className="ml-2">
              <div>
                <button
                  className="rounded-lg text-gray-300 px-2 py-2 hover:bg-gray-800 border-none bg-transparent outline-none transition-colors"
                >
                  <RiAccountCircleLine size={24} />
                </button>
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-1 z-50 flex flex-col items-center justify-center py-4 px-6 bg-white dark:bg-black rounded-lg shadow-xl text-center">
                {() => <>
                  <div className="text-lg">Welcome <span className="text-blue-200">{user.username}</span>!</div>
                  <div className="mt-4 flex flex-col justify-center gap-2">
                    <Link to="/account" className="button">
                      Edit profile
                    </Link>
                    <Link to="/logout" className="button button-secondary">
                      Logout
                    </Link>
                  </div>
                </>}
              </Popover.Panel>
            </Transition>
          </Popover>
        )}
      </div>
      <div className="mt-4 flex-1 flex flex-col py-2 px-4">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout