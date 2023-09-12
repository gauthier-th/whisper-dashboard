import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Modal from '../components/modal.jsx'

function App() {

  return (
    <div className="flex-1 flex flex-col items-center">
      <h1>Home</h1>
      <NewTranscriptionModal />
    </div>
  )
}

function NewTranscriptionModal() {
  const accessToken = useSelector((state) => state.accessToken)
  const [isNewTranscriptionOpen, setIsNewTranscriptionOpen] = useState(false)
  const [file, setFile] = useState(null)

  async function postTranscription() {
    if (!file) return
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
        body,
      })
      const data = await response.json()
      if (data) {
        toast.success('File uploaded successfully')
        setIsNewTranscriptionOpen(false)
        setFile(null)
      }
    }
    catch (e) {
      console.error(e)
      toast.error('Error while uploading file')
    }
  }

  return <>
    <button className="button" onClick={() => setIsNewTranscriptionOpen(true)}>New transcription</button>
    <Modal
      isOpen={isNewTranscriptionOpen}
      onClose={() => setIsNewTranscriptionOpen(false)}
      title="New transcription"
    >
      <span>Choose the file you want to transcribe:</span>
      <input
        type="file"
        className="mt-2 file-input"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        className="button mt-4"
        onClick={() => postTranscription()}
      >
        Send file
      </button>
    </Modal> 
  </>
}

export default App
