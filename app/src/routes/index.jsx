import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { RiLoader4Fill, RiAddFill } from 'react-icons/ri'
import Modal from '../components/modal.jsx'

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + 'B'
  }
  else if (bytes < 1024 * 1024) {
    return Math.round(bytes / 1024) + 'KB'
  }
  else if (bytes < 1024 * 1024 * 1024) {
    return Math.round(bytes / 1024 / 1024) + 'MB'
  }
  else {
    return Math.round(bytes / 1024 / 1024 / 1024) + 'GB'
  }
}

function App() {
  const accessToken = useSelector((state) => state.accessToken)
  const user = useSelector((state) => state.user)
  const [transcriptions, setTranscriptions] = useState(null)

  async function listTranscriptions() {
    if (!accessToken) return
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/transcriptions`, {
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

  async function downloadTranscription(id, format) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/transcriptions/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
      })
      const data = await response.json()
      if (data) {
        const link = document.createElement('a')
        link.href = (import.meta.env.VITE_API_URL || "/api") + data.url + (format ? '/' + format : '')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
    const timer = setInterval(() => listTranscriptions(), 5000)
    return () => clearInterval(timer)
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
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-xl">Your transcriptions:</h2>
        <NewTranscriptionModal reloadList={listTranscriptions} />
      </div>
      {!transcriptions && (
        <div className="flex justify-center items-center mt-4">
          <RiLoader4Fill className="text-3xl animate-spin" />
        </div>
      )}
      {transcriptions && transcriptions.length === 0 && (
        <div>
          <span className="text-gray-300">You don&apos;t have any transcriptions yet</span>
        </div>
      )}
      {transcriptions && transcriptions.length > 0 && (
        <div className="mt-2 w-full rounded-lg border border-gray-600 p-4">
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-8 mb-2 font-bold">
              <span className="col-span-3">File name</span>
              <span>Duration</span>
              <span>File size</span>
              {user.role === "admin" && (
                <span>User</span>
              )}
              <span>Status</span>
              <span>Actions</span>
            </div>
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="grid grid-cols-8 items-center">
                {transcription.filename ? (
                  <span className="col-span-3 overflow-hidden truncate">
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
                ) : (
                  <span className="col-span-3 italic">Hidden</span>
                )}
                <span>{Math.round(transcription.duration / 60)}min{Math.round(transcription.duration % 60)}sec</span>
                <span>{formatFileSize(transcription.size)}</span>
                {user.role === "admin" && (
                  <span>{transcription.username}</span>
                )}
                <span><StatusBadge status={transcription.status} /></span>
                <span className="flex items-center gap-2">
                  {transcription.status === "done" && transcription.user_id === user.id && (
                    <ResultModal transcription={transcription} downloadTranscription={downloadTranscription} />
                  )}
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/transcriptions`, {
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
      <RiAddFill className="mr-2 mt-0.5" />
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/transcriptions/${transcriptionId}`, {
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

function ResultModal({ transcription, downloadTranscription }) {
  const accessToken = useSelector((state) => state.accessToken)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [overview, setOverview] = useState(null)

  const result = JSON.parse(transcription.result)

  async function getTextTranscription() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/transcriptions/${transcription.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${accessToken}`
        },
      });
      const data1 = await response.json()
      if (data1) {
        const response = await fetch((import.meta.env.VITE_API_URL || "/api") + data1.url + '/txt')
        const data2 = await response.text()
        if (data2) {
          setOverview(data2)
        }
        else {
          toast.error('Error while fetching transcription')
        }
      }
      else {
        toast.error('Error while fetching transcription')
      }
    }
    catch {
      toast.error('Error while fetching transcription')
    }
  }

  useEffect(() => {
    if (isResultOpen) getTextTranscription()
  }, [isResultOpen])

  return <>
    <button
      className="button button-small"
      onClick={() => setIsResultOpen(true)}
    >
      View result
    </button>
    <Modal
      isOpen={isResultOpen}
      onClose={() => setIsResultOpen(false)}
      title="Transcription result"
      maxSize="max-w-sm sm:max-w-2xl"
    >
      <h3>Download formats:</h3>
      <div className="flex gap-2">
        {result.map((format) => (
          <a
            key={format}
            href="#"
            className="text-blue-500 underline"
            onClick={(e) => {
              e.preventDefault();
              downloadTranscription(transcription.id, format);
            }}
          >
            {format}
          </a>
        ))}
      </div>
      <h3 className="mt-4">Overview:</h3>
      {overview ? (
        <div>
          <textarea className="w-full h-64 bg-black rounded-lg py-1 px-2" value={overview} readOnly />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <RiLoader4Fill className="text-3xl animate-spin mr-2" />
        </div>
      )}
    </Modal>
  </>
}

export default App
