import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'
import MessageSignForm from '../components/message'
import { getAddressFromStorage } from '../lib/fetch.js'


export default function SignMessagePage() {
    
    const router = useRouter()
    
    const [thisAddress, setAddress] = useState({address: null, format: null, derivationPath: null})  
    const [isLoading, setLoading] = useState(false)  

    useEffect(() => {
        setLoading(true)
        const address = getAddressFromStorage("all")   
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
    
    return (
        <PageTemplate address={thisAddress.address}>
            <MessageSignForm address={thisAddress.address} format={thisAddress.format} derivationPath={thisAddress.derivationPath} />
        </PageTemplate>
    )
}
