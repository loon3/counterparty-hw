import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress, getAddressFromStorage } from '../lib/fetch.js'

var Decimal = require('decimal.js-light')


export default function BtcPage() {
    
    const router = useRouter()
    
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0})
    const [fee, setFee] = useState(null)
    const [isLoading, setLoading] = useState(false)  
    
    useEffect(() => {
        
        setLoading(true)
        
        const address = getAddressFromStorage()
        if(!address){
            router.push('/settings/select-address')
        } else {
            recommendedFee(function(feeData){
                setFee(feeData)
                console.log(feeData)
                getBtcFromAddress(address, function(btc){
                   
                    console.log(btc)                
                    const confirmedFromSats = new Decimal(btc.balance).dividedBy(1e8).toNumber()
                    const unconfirmedFromSats = new Decimal(btc.unconfirmed_balance).dividedBy(1e8).toNumber()
                    setBtcBalance({confirmed: confirmedFromSats, unconfirmed: unconfirmedFromSats})

                    setAddress(address)
                    setLoading(false)                      

                })
            })         
        }

    }, [])
    
    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )
    
    return (
        <PageTemplate address={thisAddress} btc={btcBalance}>
            <AssetSendForm address={thisAddress} asset="BTC" balance={btcBalance.confirmed} btc={btcBalance} fee={fee}>
                <button onClick={() => router.push('/connect')} className={styles.card}>
                    <p>&larr; Back to Wallet</p>
                </button>
            </AssetSendForm>
        </PageTemplate>
    )
}
