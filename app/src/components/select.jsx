import { Fragment, useRef } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { RiCheckLine } from 'react-icons/ri'
import { HiSelector } from 'react-icons/hi'

export default function Select({ value, setValue, values, accessor, placeholder }) {
  const containerRef = useRef(null)

  return <div>
    <Listbox value={value} onChange={setValue}>
      <div ref={containerRef} className="relative">
        <Listbox.Button className="relative w-full text-left bg-gray-700 input-field">
          <span className={`block truncate${(accessor && value ? accessor(value) : value) ? "" : " opacity-60"}`}>
            {(accessor && value ? accessor(value) : value) || (placeholder ?? "Choose an option")}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <HiSelector
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {() => (
            <Listbox.Options className="z-10 absolute w-full py-1 mt-1 overflow-auto bg-gray-700 rounded-md shadow-lg max-h-[240px] ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
              {values.map((value, key) => (
                <Listbox.Option
                  key={key}
                  className={({ active }) =>
                    `${active ? 'bg-indigo-700' : 'text-white'}
                          cursor-default select-none relative py-2 pl-10 pr-4 transition-colors duration-100`
                  }
                  value={value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate`}
                      >
                        {(accessor && value ? accessor(value) : value) || (placeholder ?? "Choose an option")}
                      </span>
                      {selected ? (
                        <span className="text-blue-300 absolute inset-y-0 left-0 flex items-center pl-3">
                          <RiCheckLine className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </Transition>
      </div>
    </Listbox>
  </div>
}
