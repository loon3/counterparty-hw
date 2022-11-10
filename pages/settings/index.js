import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../components/template'
import ModalTemplate from '../../components/modal'
import Loading from '../../components/loading'
import { getAddressFromStorage, getPassphraseFromStorage } from '../../lib/fetch.js'


export default function SettingsPage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  
    const [viewPassphrase, setViewPassphrase] = useState(false)
    const [passphrase, setPassphrase] = useState(null)
    const [passphraseModal, setPassphraseModal] = useState(false) 
    
    function handleViewPassphrase(){
        setPassphrase(getPassphraseFromStorage())
        setPassphraseModal(true)
    }
    
    function handleViewPassphraseClose(){       
        setPassphraseModal(false)
    }
    
    function ViewPassphraseModal() {
      
      return (
        <>
          {passphraseModal ? (
            <ModalTemplate title="Wallet Passphrase">  
                <div className="text-center">
                    <div className="text-lg font-bold my-12">{passphrase}</div>
                    <button className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mt-1 ease-linear transition-all duration-150" onClick={() => handleViewPassphraseClose()}>
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
        const address = getAddressFromStorage("array")
        console.log(address)
        
        if(!address){
            router.push('/settings/select')
        } else {
            setAddress(address)
            if(address.key == "passphrase"){setViewPassphrase(true)}
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
        <ViewPassphraseModal />
        <h1 className="text-3xl font-bold mb-8">
          Settings
        </h1>
        <div className={styles.grid}>
            <Link href="/settings/select">
              <a href="#" className={styles.card}>
                <h3>Select Wallet&frasl;Address &rarr;</h3>
              </a>
            </Link>
{viewPassphrase &&
             
               <div onClick={() => handleViewPassphrase()} className={styles.card}>
                  <h3>View Passphrase &rarr;</h3>
                </div>
         
}
                
            <Link href="/settings/forget">
               <a href="#" className={styles.card}>
                  <h3>Forget Wallet &rarr;</h3>
                </a>
             </Link>
        
        </div>
    </PageTemplate>
    )
}
