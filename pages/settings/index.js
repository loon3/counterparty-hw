import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../components/template'
import { getAddressFromStorage } from '../../lib/fetch.js'


export default function SettingsPage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  
    

    useEffect(() => {
        
        setLoading(true)
        const address = getAddressFromStorage("array")
        
        if(!address){
            router.push('/settings/select')
        } else {
            setAddress(address)
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
          Settings
        </h1>
        <div className={styles.grid}>
            <Link href="/settings/select">
              <a href="#" className={styles.card}>
                <h3>Select Wallet &nbsp; &frasl; &nbsp; Address &rarr;</h3>
              </a>
            </Link>
        
                
            <Link href="/settings/forget">
               <a href="#" className={styles.card}>
                  <h3>Forget Wallet &rarr;</h3>
                </a>
             </Link>
        
        </div>
    </PageTemplate>
    )
}
