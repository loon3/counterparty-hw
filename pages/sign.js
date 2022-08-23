import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import PageTemplate from '../components/template'
import MessageSignForm from '../components/message'


export default function SignMessagePage() {
    
    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(false)  

    useEffect(() => {
        setLoading(true)
        const address = window.sessionStorage.getItem("address")    
        setAddress(address)
        setLoading(false)
    }, [])

    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )
    
    return (
    <PageTemplate address={thisAddress}>
        <MessageSignForm address={thisAddress} />
        <div className={styles.grid}>
            <Link href="/connect">
              <a href="#" className={styles.card}>
                <p>&larr; Back to Wallet</p>
              </a>
            </Link>
        </div>
    </PageTemplate>
    )
}
