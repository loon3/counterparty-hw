import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import PageTemplate from '../../components/template'
import { getAddressSelectLedger } from '../../lib/ledger.js'
import { getAddressFromStorage } from '../../lib/fetch.js'

import AddAddressSelect from '../../components/add-address'


export default function SelectAddressPage() {
    
    const router = useRouter()
    
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null) 
    const [addressList, setAddressList] = useState(null)     
    const [isLoading, setLoading] = useState(false)  
    
    function handleAddressSelect(address){
        
        window.localStorage.setItem("address", JSON.stringify(address))
        
        router.push('/connect')
        
    }

    useEffect(() => {
        setLoading("Loading...")
        
        const address = getAddressFromStorage()    

        setAddress(address)
        
        const addressList = window.localStorage.getItem("addressList")
        
        if(!addressList){
            
            setLoading("Getting addresses from device...")
        
            getAddressSelectLedger(function(deviceResponse){            
                if(deviceResponse.status == "success"){
                    window.localStorage.setItem("addressList", JSON.stringify(deviceResponse.message))
                    setAddressList(deviceResponse.message)
                    setLoading(false)   
                } else {
                    setError(deviceResponse.message)
                    setLoading(false)                
                } 
            })
            
        } else {
            setAddressList(JSON.parse(addressList))
            setLoading(false)           
        }
             
    }, [])

    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">{isLoading}</div>
        </PageTemplate>
    )

    if (!addressList) return (
        <PageTemplate>
            <div>{error}</div>
        </PageTemplate>
    )
   
    return (
    <PageTemplate address={thisAddress}>
        <h1 className="text-3xl font-bold mb-8">
          Select Wallet Address
        </h1>
        <div className={styles.grid}>
            <ul role="list" className="p-6 divide-y divide-slate-200">
            {addressList.map((address) => (
                <li 
                    className={styles.addressListSelect} 
                    key={address.address}
                    onClick={() => handleAddressSelect(address)}
                >
                    <div className="ml-3 overflow-hidden truncate py-4">
                        <div className="inline-block text-sm font-medium">{address.address}</div>
                        <div className="inline-block text-xs p-1 mx-2 text-white bg-slate-400 rounded float-right">{address.formatType} &#35;{address.index+1}</div>
                    </div>
                </li>
            ))}
                <li className={styles.addressListSelect}>
                    <AddAddressSelect />
                </li>
            </ul>
        </div>
        
    </PageTemplate>
    )
    
//        <div className="mt-12">
//            <div className={styles.grid}>
//                <Link href="/settings">
//                  <a href="#" className={styles.card}>
//                    <p>&larr; Back to Settings</p>
//                  </a>
//                </Link>
//            </div>
//        </div>
}
