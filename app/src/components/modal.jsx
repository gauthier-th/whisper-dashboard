import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { RiCloseFill } from 'react-icons/ri'

export default function Modal({ isOpen, children, onClose, title, className, maxSize }) {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-70" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto pointer-events-none">
            <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className={`w-full pointer-events-auto ${maxSize ?? "max-w-sm sm:max-w-md"} transform overflow-hidden rounded-2xl bg-gray-800 p-3 sm:p-5 text-left align-middle shadow-xl transition-all text-white ${className}`}>
                  <div className="absolute cursor-pointer top-3 right-3 sm:top-5 sm:right-5">
                    <RiCloseFill className="text-xl text-gray-500 transition-colors hover:text-red-500" onClick={onClose} />
                  </div>
                  {/* To avoid scroll on the bottom button */}
                  <div style={{ maxWidth: 0, maxHeight: 0, overflow: "hidden" }}>
                    <input autoFocus />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 mb-3"
                  >
                    {title}
                  </Dialog.Title>
                  {children}
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}