import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Modal from '../components/modal.jsx'
import { HiOutlinePlus } from 'react-icons/hi'

function App() {
  const accessToken = useSelector((state) => state.accessToken)
  const [transcriptions, setTranscriptions] = useState(null)
  
  async function listTranscriptions() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transcriptions`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
      })
      const data = await response.json()
      if (data) {
        setTranscriptions(data)
      }
      else {
        toast.error('Error while fetching transcriptions')
      }
    }
    catch {
      toast.error('Error while fetching transcriptions')
    }
  }

  async function downloadTranscription(id) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transcriptions/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
      });
      const data = await response.json()
      if (data) {
        const link = document.createElement('a');
        link.href = import.meta.env.VITE_API_URL + data.url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else {
        toast.error('Error while downloading transcription')
      }
    }
    catch {
      toast.error('Error while downloading transcription')
    }
  }

  useEffect(() => {
    listTranscriptions()
  }, [])

  function StatusBadge({ status }) {
    if (status === "pending") {
      return <span className="bg-yellow-500 rounded-full px-2.5 py-1">Pending</span>
    }
    else if (status === "processing") {
      return <span className="bg-blue-500 rounded-full px-2.5 py-1">Processing</span>
    }
    else if (status === "done") {
      return <span className="bg-green-500 rounded-full px-2.5 py-1">Done</span>
    }
    else {
      return <span className="bg-red-500 rounded-full px-2.5 py-1">Error</span>
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center py-2 px-4">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-xl">Your transcriptions:</h2>
        <NewTranscriptionModal reloadList={listTranscriptions} />
      </div>
      {transcriptions?.length === 0 && (
        <div>
          <span className="text-gray-300">You don&apos;t have any transcriptions yet</span>
        </div>
      )}
      {transcriptions?.length > 0 && (
        <div className="mt-2 w-full rounded-lg border border-gray-600 p-4">
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-8 mb-2 font-bold">
              <span className="col-span-4">File name</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="grid grid-cols-8 items-center">
                <span className="col-span-4 overflow-hidden truncate">
                  <a
                    href="#"
                    className="text-blue-500 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadTranscription(transcription.id);
                    }}
                    >
                    {transcription.filename}
                  </a>
                </span>
                <span>{Math.round(transcription.duration / 60)}min{Math.round(transcription.duration % 60)}sec</span>
                <span><StatusBadge status={transcription.status} /></span>
                <span className="flex items-center gap-2">
                  <DeleteModal transcriptionId={transcription.id} reloadList={listTranscriptions} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NewTranscriptionModal({ reloadList }) {
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
        reloadList()
      }
    }
    catch (e) {
      console.error(e)
      toast.error('Error while uploading file')
    }
  }

  return <>
    <button className="button" onClick={() => setIsNewTranscriptionOpen(true)}>
      <HiOutlinePlus className="mr-2 mt-0.5" />
      New transcription
    </button>
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

function DeleteModal({ transcriptionId, reloadList }) {
  const accessToken = useSelector((state) => state.accessToken)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  async function deleteTranscription() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transcriptions/${transcriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
      })
      if (response.status === 204) {
        toast.success('Transcription deleted successfully')
        setIsDeleteOpen(false)
        reloadList()
      }
      else {
        toast.error('Error while deleting transcription')
      }
    }
    catch {
      toast.error('Error while deleting transcription') 
    }
  }

  return <>
    <button
      className="button button-small bg-red-500 disabled:bg-red-900"
      onClick={() => setIsDeleteOpen(true)}
    >
      Delete
    </button>
    <Modal
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      title="Delete transcription"
    >
      <span>Are you sure you want to delete this transcription?</span>
      <div className="flex justify-end items-center gap-4 mt-4">
        <button
          className="button button-secondary"
          onClick={() => setIsDeleteOpen(false)}
        >
          Cancel
        </button>
        <button
          className="button bg-red-500 disabled:bg-red-900"
          onClick={() => deleteTranscription()}
        >
          Delete
        </button>
      </div>
    </Modal>
  </>
}

export default App
