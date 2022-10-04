import styles from '../styles/Home.module.css'
import Link from 'next/link'
import React from 'react';
import PageTemplate from '../components/template'
import Image from 'next/image';
import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { getAddressFromStorage } from '../lib/fetch.js'

import { useRouter } from 'next/router'



export default function ConnectLandingPage() {
    
    
    const router = useRouter()
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
      
        const address = getAddressFromStorage("all")
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

    if (!thisAddress) return (
        <PageTemplate>
            <div>{error}</div>
        </PageTemplate>
    )

    return (  
        <PageTemplate hideLogoInFooter>
            <div>
                <Image src="/rarefakemerge.gif" height="200px" width="200px" alt=""/>
            </div>
            <h1 className="text-3xl font-bold">
              Wallet Address
            </h1>

            <div className="text-2xl mb-12 text-center">
                {thisAddress.key == "ledger" &&
                    <div className="inline-block mr-2 align-middle -mt-[2px] select-none"><Image src="/ledger-logo.png" height="20px" width="23px" /></div>
                }
                <div className="inline-block break-all">{thisAddress.address}</div>
            </div>
        
            <div className={styles.grid}>
              <Link href="/collection">
                  <a href="#" className={styles.card}>
                    <h3>View Collection &rarr;</h3>
                  </a>
              </Link>

              <Link href="/sign">
               <a href="#" className={styles.card}>
                  <h3>Sign Message &rarr;</h3>
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



