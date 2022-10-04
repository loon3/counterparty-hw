import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../components/template'
import { getAddressFromStorage, checkConnected } from '../../lib/fetch.js'

export default function ForgetPage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  
    const [connected, setConnected] = useState({ledger: false, passphrase: false, both: false})
    
    function handleForget(source){
         
        let activeAddressRemoved = false
        if(source == getAddressFromStorage("key")){
            window.sessionStorage.removeItem("address")
            activeAddressRemoved = true
        } 
        if(source == "all"){
            window.localStorage.clear()
            window.sessionStorage.clear()
        }
        if(source == "passphrase"){
            window.localStorage.removeItem("addressListPassphrase")
            window.localStorage.removeItem("passphrase")
            window.sessionStorage.removeItem("passphrase")
            if(connected.both && activeAddressRemoved){
                window.sessionStorage.setItem("address", JSON.stringify(JSON.parse(connected.ledger)[0]))
            }
        }        
        if(source == "ledger"){
            window.localStorage.removeItem("addressListLedger")
            if(connected.both && activeAddressRemoved){
                window.sessionStorage.setItem("address", JSON.stringify(JSON.parse(connected.passphrase)[0]))
            }
        }        

        router.push('/')
    }

    useEffect(() => {
        setLoading(true)
        
        setConnected(checkConnected())
        
        const address = getAddressFromStorage("all") 
        if(address){setAddress(address)}  
        
        setLoading(false)

    }, [])
    
    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )
    
    return (
    <PageTemplate address={thisAddress}>
        {connected.any &&
            <h1 className="text-3xl font-bold mb-8">
              Are you sure you want to continue?
            </h1>
        }
        <div className={styles.grid}>
           
            {connected.ledger &&
              <a href="#" className={styles.card} onClick={() => handleForget("ledger")}>
                <h3>Forget Ledger Device &rarr;</h3>
              </a>
            }
            
            {connected.passphrase &&
              <a href="#" className={styles.card} onClick={() => handleForget("passphrase")}>
                <h3>Forget Passphrase &rarr;</h3>
              </a>
            }

            {connected.both && 
              <a href="#" className={styles.card} onClick={() => handleForget("all")}>
                <h3>Forget Both &rarr;</h3>
              </a>
            }
        </div>
        
    </PageTemplate>
    )
}
