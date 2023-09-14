import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { useSelector } from "react-redux"

function Logout() {
  const accessToken = useSelector((state) => state.accessToken)
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const passwordInput = useRef(null)
  const newPasswordInput = useRef(null)
  const newPasswordConfirmInput = useRef(null)

  async function changePassword() {
    try {
      if (!password || !newPassword || !newPasswordConfirm) {
        return
      }
      if (newPassword !== newPasswordConfirm) {
        toast.error('Passwords do not match')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${accessToken}`
        },
        body: JSON.stringify({ password, newPassword }),
      });
      if (response.ok) {
        toast.success('Password changed successfully')
      }
      else {
        toast.error('Error while changing password')
      }
    }
    catch {
      toast.error('Error while changing password')
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <h1 className="text-3xl">Edit your profile</h1>
      <h2 className="text-xl mt-4">Change your password</h2>
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="current-password">
          Current password
        </label>
        <input
          ref={passwordInput}
          className="input-field"
          id="current-password"
          type="password"
          placeholder="Current password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && newPasswordInput.current.focus()}
        />
      </div>
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="new-password">
          New password
        </label>
        <input
          ref={newPasswordInput}
          className="input-field"
          id="new-password"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && newPasswordConfirmInput.current.focus()}
        />
      </div>
      <div className="w-96 max-w-full">
        <label className="input-label" htmlFor="new-password-confirm">
          Confirm new password
        </label>
        <input
          ref={newPasswordConfirmInput}
          className="input-field"
          id="new-password-confirm"
          type="password"
          placeholder="Confirm new password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && changePassword()}
        />
      </div>
      <button className="button max-w-full" onClick={() => changePassword()}>
        Change password
      </button>
    </div>
  )
}

export default Logout
