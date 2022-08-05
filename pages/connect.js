import styles from '../styles/Home.module.css'
import Link from 'next/link'
import React from 'react';
import PageTemplate from '../components/template'

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { getAddressLedger } from '../lib/ledger.js'


export default function ConnectLedger() {
      
  const [error, setError] = useState(null)
  const [thisAddress, setAddress] = useState(null)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  
  useEffect(() => {
      setLoading(true)
      
      const address = window.sessionStorage.getItem("address")
      
      if(!address){
      
          getAddressLedger(function(deviceResponse){

              if(deviceResponse.status == "success"){

                      setAddress(deviceResponse.message)
                      window.sessionStorage.setItem("address", deviceResponse.message)
                      setLoading(false)

              } else {
                  console.log(deviceResponse.message)
                  setError(deviceResponse.message)
                  setLoading(false)
              }

          })
          
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



