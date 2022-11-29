import styles from '../../../styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../../components/template'
import ModalTemplate from '../../../components/modal'
import Loading from '../../../components/loading'
import { getAddressFromStorage, checkConnected } from '../../../lib/fetch.js'

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

export default function SelectTypePage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  
    const [showLedgerInfo, setShowLedgerInfo] = useState(false)  
    
    const [isAttachedLedger, setAttachedLedger] = useState(false)
    const [isAttachedPassphrase, setAttachedPassphrase] = useState(false)
    
    function handleLedgerClick() {
        if(isAttachedLedger){
            router.push('/settings/select/ledger')
        } else {
            setShowLedgerInfo(true)
        }
    }
    
    function handleLedgerInfoConnect() {
        router.push('/settings/select/ledger')
    }
    
    
    function LedgerInfoModal() {
      
      return (
        <>
          {showLedgerInfo ? (
            <ModalTemplate>                 
               <div className="w-full px-5 pt-4 pb-8 my-2">
           <div className="pb-10 text-2xl text-center font-bold underline">
           Connecting Your Ledger Hardware Wallet
           </div>
           <div className="pb-6">
                To connect, you must first <a href="https://support.ledger.com/hc/en-us/articles/115005195945-Bitcoin-BTC-?docs=true" target="_blank" rel="noreferrer"><span className="text-blue-500 underline">install the Bitcoin (BTC) App</span></a> on your Ledger device.
           </div>
           <div>
                Once the Bitcoin (BTC) App is installed... 
           </div> 
           <div className="px-12 pt-4 font-bold">
           <ol className="list-decimal">
           <li className="pb-2">Ensure your Ledger device is connected via USB</li>
           <li className="pb-2">Unlock the device</li>
           <li className="pb-2">Open the Bitcoin (BTC) App</li>
           <li>Click CONNECT LEDGER below</li>
           </ol>
           </div>
                     
               </div>
                <div className="flex flex-col max-w-xs text-center m-auto">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="button" onClick={() => handleLedgerInfoConnect()}>
                        Connect Ledger
                    </button>
                </div>
                <div className="flex flex-col max-w-xs text-center m-auto">
                    <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => setShowLedgerInfo(false)}>
                        Close
                    </button>
                </div>
             
            </ModalTemplate>
          ) : null}
        </>
      )
    }

    useEffect(() => {
        setLoading(true)
        const addressFromStorage = getAddressFromStorage("all") 
        const connected = checkConnected()
        
        console.log(connected)
        
        if(addressFromStorage){
            
            setAddress(addressFromStorage)
            
            const currentAddressKey = addressFromStorage.key
            if(currentAddressKey == "ledger" || connected.both){setAttachedLedger(true)}
            if(currentAddressKey == "passphrase" || connected.both){setAttachedPassphrase(true)}
            setLoading(false)
        } else {
            if(connected.any == "ledger" || connected.both){setAttachedLedger(true)}
            if(connected.any == "passphrase" || connected.both){setAttachedPassphrase(true)}     
            setLoading(false)
        }
            
        
 
    }, [])

    if (isLoading) return (
        <PageTemplate type="centeredFull">
            <Loading />
        </PageTemplate>
    )
    
    return (
    <PageTemplate address={thisAddress}>
        <LedgerInfoModal />
        <div className="my-16">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Select Wallet
        </h1>
        <div className={styles.grid}>
           

                <a href="#" onClick={() => handleLedgerClick()} className={styles.card}>
                    <h3><div className="inline-block mr-1 align-middle -mt-[5px] select-none"><Image src="/ledger-logo-green.png" height="17px" width="20px" /></div> Ledger Nano <div className="inline-block ml-1 mr-2 -mt-1 text-sm align-middle">S &frasl; S Plus &frasl; X </div>&rarr;</h3>
                    {isAttachedLedger ? 
                        (<div className='text-blue-400 text-md text-center mt-3'><CheckCircleIcon className="m-auto h-6"/>Connected</div>
                        ) : (<div className='text-red-400 text-md text-center mt-3'><XCircleIcon className="m-auto h-6"/>Not Connected</div>)
                    }
                </a>

            <Link href="/settings/select/passphrase">
                <a href="#" className={`${styles.card} justify-center`}>
                    <h3>Passphrase  &rarr;</h3>
                    {isAttachedPassphrase ? 
                        (<div className='text-blue-400 text-md text-center mt-3'><CheckCircleIcon className="m-auto h-6"/>Connected</div>
                        ) : (<div className='text-red-400 text-md text-center mt-3'><XCircleIcon className="m-auto h-6"/>Not Connected</div>)
                    }
                </a>
            </Link>

        </div>
        </div>
    </PageTemplate>
    )
}
