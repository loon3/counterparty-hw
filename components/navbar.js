import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { classNames, viewToName } from '../lib/util.js' 

import { useState, useEffect } from "react";

const directories = [
  {
    name: 'Rare Pepes',
    description: '2016 - 2018',
    view: 'rare-pepes',

  },
  {
    name: 'Fake Rares',
    description: '2021 - present',
    view: 'fake-rares',

  },
  {
    name: 'Dank Rares',
    description: "2021 - present",
    view: 'dank-rares',
   
  },
  { 
    name: 'Fake Commons', 
    description: "2022 - present", 
    view: 'fake-commons'
  },
  {
    name: 'Other',
    description: 'Directory Unknown',
    view: 'other',

  },
]



export default function AssetNavbar(props) {
    
    const [inputValue, setInputValue] = useState('')
    const [timer, setTimer] = useState(null)
    
    function handleSearch(e){
        setInputValue(e.target.value)

        clearTimeout(timer)

        const newTimer = setTimeout(() => {
            props.setSearch(e.target.value)
            props.setResetList(true)
        }, 500)

        setTimer(newTimer)        
        
    }    
    
    function handleSelectView(view){
        props.setView(view)
        props.setResetList(true)
    }    
    
    return (

      <div className="mx-auto">
        <div className="flex items-center justify-between border-b-2 border-stone-200 py-3 mt-6 md:mt-0 bg-stone-100 text-left px-[17px]">

            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={classNames(
                      open ? 'text-gray-500' : 'text-gray-500',
                      'group inline-flex items-center rounded-md bg-white text-base font-medium outline outline-1 py-3 px-2 border-1 focus:outline-green-500'
                    )}
                  >
                    <div className="inline-block w-28 text-sm sm:text-base sm:w-40 text-left pl-2">{viewToName(props.view)}</div>
                    <ChevronDownIcon
                      className={classNames(
                        open ? 'text-gray-500' : 'text-gray-500',
                        'ml-2 h-5 w-5 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
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
                    <Popover.Panel className="absolute z-10 -ml-6 mt-3 w-screen max-w-sm transform px-2 md:-ml-2">
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                          {directories.map((item) => (
                            <Popover.Button
                              key={item.name}
                              href={item.href}
                              className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50 text-left"
                              onClick={() => handleSelectView(item.view)}
                            >
                             
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                              </div>
                            </Popover.Button>
                          ))}
                        </div>
                        <div className="space-y-6 bg-gray-50 py-5 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                         
                           
                              <Popover.Button
                                href="#"
                                className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-100 text-center mx-auto w-full"
                              >
                                 <div className="w-full text-center" onClick={() => handleSelectView("show-all")}>Show All</div>
                              </Popover.Button>
                           
                       
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            
          <div className="relative mr-[7px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="assetSearch"
              id="assetSearch"
              className="block w-full rounded-md outline outline-1 focus:outline-green-500 mx-2 pl-10 py-3 text-gray-500 text-sm sm:text-base"
              placeholder="RAREPEPE"
              spellCheck="false"
              onChange={handleSearch}
            />
          </div>
       
        </div>
      </div>

 
  )
}


