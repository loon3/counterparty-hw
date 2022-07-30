import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { getAssetsFromAddress } from '../lib/fetch.js'
import { getAddressLedger } from '../lib/ledger.js'
import { recommendedFee } from "../lib/xcp.js"



export default function CollectionList(props) {
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [collection, setCollection] = useState(null)
    const [sendData, setSendData] = useState(null)
    const [fee, setFee] = useState(null)
    
    const [isLoading, setLoading] = useState(false)  
    const [isSend, setSend] = useState(false)
      
    function handleSend(asset, balance, divisible){
        setSendData({asset: asset, balance: balance, divisible: divisible})
        setSend(true)
    }
    
    function handleBack(){
        setSend(false)
    }
  
    useEffect(() => {
        setLoading(true)

        const address = window.sessionStorage.getItem("address")

        if(address){
            recommendedFee(function(feeData){
                setFee(feeData)
                getAssetsFromAddress(address, function(res) {     
                    
                    console.log(res.data)

                    setCollection(res.data)
                    setAddress(address)
                    setLoading(false)
                })   
            })
        } else {
            setError("Device not connected.")
            setLoading(false)
        }      

    }, [])

    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )

    if (!collection) return (
        <PageTemplate>
            <div className="mb-12">{error}</div>
            <div className={styles.grid}>
                <Link href="/">
                  <a href="#" className={styles.card}>
                    <p>&larr; Back to home</p>
                  </a>
                </Link>
            </div>
        </PageTemplate>
    )

    if (isSend) {
        return (
            <PageTemplate>
                <AssetSendForm asset={sendData.asset} balance={sendData.balance} divisible={sendData.divisible} fee={fee} />
                
                    <button onClick={() => handleBack()} className={styles.card}>
                        <p>&larr; Back to Collection</p>
                    </button>
             
            </PageTemplate>    
        )   
    }

    return (  
        <PageTemplate>
            <h1 className="text-3xl font-bold">
              Collection
            </h1>
            <p className="mb-12">
              {thisAddress}
            </p>
            <div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full mb-16">  
                {collection.map((asset) => (
                    <div 
                        key={asset.asset} 
                        className="my-1 px-1 hover:bg-slate-100 cursor-pointer text-center"
                        onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible)}
                    >
                        <div className="m-3">
                            <div className="text-sm font-medium text-gray-900">{asset.asset}</div>
                            <div className="text-sm text-gray-500">Balance: {asset.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>

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



