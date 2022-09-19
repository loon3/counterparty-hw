import styles from '../styles/Home.module.css'
import Link from 'next/link'
import React from 'react';
import PageTemplate from '../components/template'

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { getAddressFromStorage } from '../lib/fetch.js'

import { useRouter } from 'next/router'



export default function ConnectLedger() {
    
    
    const router = useRouter()
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
      
        const address = getAddressFromStorage()
        if(!address){
            router.push('/settings/select-address')
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

    if (!thisAddress) return (
        <PageTemplate>
            <div>{error}</div>
        </PageTemplate>
    )

    return (  
        <PageTemplate>
            <h1 className="text-3xl font-bold">
              Wallet Address
            </h1>
            <h1 className="text-2xl mb-12">
              {thisAddress}
            </h1>
            <div className={styles.grid}>
              <Link href="/collection">
                  <a href="#" className={styles.card}>
                    <h3>View Collection &rarr;</h3>
                  </a>
              </Link>

              <Link href="/settings">
               <a href="#" className={styles.card}>
                  <h3>Settings &rarr;</h3>
                </a>
             </Link>
            </div>
        </PageTemplate>
    )
}



