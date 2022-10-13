import styles from '../../../styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../../components/template'
import ModalTemplate from '../../../components/modal'
import { getAddressFromStorage, checkConnected } from '../../../lib/fetch.js'

export default function SelectTypePage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  
    
    const [isAttachedLedger, setAttachedLedger] = useState(false)
    const [isAttachedPassphrase, setAttachedPassphrase] = useState(false)

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
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )
    
    return (
    <PageTemplate address={thisAddress}>
        <h1 className="text-3xl font-bold mb-8">
          Select Wallet
        </h1>
        <div className={styles.grid}>
           
            <Link href="/settings/select/ledger">
                <a href="#" className={styles.card}>
                    <h3><div className="inline-block mr-1 align-middle -mt-[5px] select-none"><Image src="/ledger-logo-green.png" height="17px" width="20px" /></div> Ledger Nano <div className="inline-block ml-1 mr-2 -mt-1 text-sm align-middle">S &frasl; S Plus &frasl; X </div>&rarr;</h3>
                    {isAttachedLedger ? 
                        (
                            <p className='text-green-600'>CONNECTED</p>
                        ) : (
                            <p className='text-red-500'>NOT CONNECTED</p>
                        )
                    }
                </a>
            </Link>
            <Link href="/settings/select/passphrase">
                <a href="#" className={`${styles.card} justify-center`}>
                    <h3>Passphrase  &rarr;</h3>
                    {isAttachedPassphrase ? 
                        (
                            <p className='text-green-600'>CONNECTED</p>
                        ) : (
                            <p className='text-red-500'>NOT CONNECTED</p>
                        )
                    }
                </a>
            </Link>

        </div>
        
    </PageTemplate>
    )
}
