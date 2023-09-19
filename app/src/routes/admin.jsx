import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"
import { RiLoader4Fill } from "react-icons/ri"
import Modal from "../components/modal"
import Select from "../components/select"

function Logout() {
  const accessToken = useSelector((state) => state.accessToken)
  const loggedUser = useSelector((state) => state.user);
  const [users, setUsers] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailInput = useRef(null)
  const passwordInput = useRef(null)

  async function getUsers() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setUsers(data)
      }
      else {
        toast.error('Failed to fetch users')
      }
    }
    catch {
      toast.error('Failed to fetch users')
    }
  }

  async function createUser() {
    try {
      if (!username || !email || !password) return
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username, email, password }),
      })
      if (response.ok) {
        toast.success('User created')
        setUsername('')
        setEmail('')
        setPassword('')
        getUsers()
      }
    }
    catch {
      toast.error('Failed to create user')
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <h1 className="text-3xl">Admin panel</h1>
      <h2 className="text-xl mt-4">Create an user</h2>
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="username">
          Username
        </label>
        <input
          className="input-field"
          id="username"
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && emailInput.current.focus()}
        />
      </div>
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="email">
          Email
        </label>
        <input
          ref={emailInput}
          className="input-field"
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onKeyDown={(e) => e.key === 'Enter' && createUser()}
        />
      </div>
      <button className="button max-w-full" onClick={() => createUser()}>
        Create user
      </button>
      <h2 className="text-xl mt-6">Users list</h2>
      {!users && (
        <div className="flex justify-center items-center">
          <RiLoader4Fill className="text-3xl animate-spin" />
        </div>
      )}
      {users && (
        <div className="mt-2 rounded-lg border border-gray-600 p-4">
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-5 gap-4 mb-2 font-bold">
              <span>Username</span>
              <span>Email</span>
              <span>Role</span>
              <span>Created at</span>
              <span>Actions</span>
            </div>
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-5 gap-4 items-center">
                <span>{user.username}</span>
                <span>{user.email}</span>
                <span className="capitalize">{user.role}</span>
                <span>{new Date(user.created_at).toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  {(user.id !== 1 || loggedUser.id === 1) && (
                    <UpdateUserModal user={user} getUsers={getUsers} />
                  )}
                  {user.id !== 1 && (
                    <DeleteUserModal user={user} getUsers={getUsers} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UpdateUserModal({ user, getUsers }) {
  const acccessToken = useSelector((state) => state.accessToken)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user.role)
  const emailInput = useRef(null)
  const passwordInput = useRef(null)

  async function updateUser() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${acccessToken}`,
        },
        body: JSON.stringify({ username, email, password, role }),
      })
      if (response.ok) {
        toast.success('User updated')
        getUsers()
        setIsUpdateOpen(false)
      }
      else {
        toast.error('Failed to update user')
      }
    }
    catch {
      toast.error('Failed to update user')
    }
  }
  
  return <>
    <button className="button" onClick={() => setIsUpdateOpen(true)}>Edit</button>
    <Modal
      isOpen={isUpdateOpen}
      onClose={() => setIsUpdateOpen(false)}
      title="Edit user"
    >
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="username">
          Username
        </label>
        <input
          className="input-field"
          id="username"
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && emailInput.current.focus()}
        />
      </div>
      <div className="w-96 max-w-full mt-2">
        <label className="input-label" htmlFor="email">
          Email
        </label>
        <input
          ref={emailInput}
          className="input-field"
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && passwordInput.current.focus()}
        />
      </div>
      <div className="w-96 max-w-full mt-2">
        <label className="input-label" htmlFor="role">
          Role
        </label>
        <div className="relative">
          <Select
            value={role}
            setValue={setRole}
            values={['user', 'admin']}
            accessor={(value) => value.substring(0, 1).toUpperCase() + value.substring(1)}
          />
        </div>
      </div>
      <div className="w-96 max-w-full mt-2">
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
          onKeyDown={(e) => e.key === 'Enter' && updateUser()}
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button className="button button-secondary" onClick={() => setIsUpdateOpen(false)}>
          Cancel
        </button>
        <button className="button" onClick={() => updateUser()}>
          Update
        </button>
      </div>
    </Modal>
  </>
}

function DeleteUserModal({ user, getUsers }) {
  const accessToken = useSelector((state) => state.accessToken)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  async function deleteUser() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        toast.success('User deleted')
        getUsers()
      }
      else {
        toast.error('Failed to delete user')
      }
    }
    catch {
      toast.error('Failed to delete user')
    }
  }

  return <>
    <button className="button bg-red-500" onClick={() => setIsDeleteOpen(true)}>Delete</button>
    <Modal
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      title="Delete user"
    >
      <p>Are you sure you want to delete this user?</p>
      <div className="flex justify-end gap-2 mt-4">
        <button className="button button-secondary" onClick={() => setIsDeleteOpen(false)}>
          Cancel
        </button>
        <button className="button bg-red-500" onClick={() => deleteUser()}>
          Delete
        </button>
      </div>
    </Modal>
  </>
}

export default Logout
