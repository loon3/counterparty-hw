import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress } from '../lib/fetch.js'
import { getAddressLedger } from '../lib/ledger.js'

var Decimal = require('decimal.js-light')


export default function CollectionList(props) {
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0})
    const [collection, setCollection] = useState(null)
    const [sendData, setSendData] = useState(null)
    const [fee, setFee] = useState(null)
    
    const [isLoading, setLoading] = useState(false)  
    const [isSend, setSend] = useState(false)
    
    function handleSend(asset, balance, divisible, unconfirmed){
        
        const balConf = new Decimal(balance)
        const balUnconf = new Decimal(unconfirmed)
        const finalBalance = balConf.plus(balUnconf).toNumber(); 
 
        setSendData({asset: asset, balance: finalBalance, divisible: divisible})
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
                console.log(feeData)
                getBtcFromAddress(address, function(btc){
                    const confirmedFromSats = new Decimal(btc.balance).dividedBy(1e8).toNumber()
                    const unconfirmedFromSats = new Decimal(btc.unconfirmed_balance).dividedBy(1e8).toNumber()
                    setBtcBalance({confirmed: confirmedFromSats, unconfirmed: unconfirmedFromSats})
            
                    getAssetsFromAddress(address, function(res) {  
                        console.log(res.data)

                        setCollection(res.data)
                        setAddress(address)
                        setLoading(false)                      

                    })  
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
            <PageTemplate address={thisAddress} btc={btcBalance}>
                <AssetSendForm asset={sendData.asset} balance={sendData.balance} divisible={sendData.divisible} fee={fee} btc={btcBalance}>
                    <button onClick={() => handleBack()} className={styles.card}>
                        <p>&larr; Back to Collection</p>
                    </button>
                </AssetSendForm>
            </PageTemplate>    
        )   
    }

    return (  
        <PageTemplate address={thisAddress} btc={btcBalance}>
            <h1 className="text-3xl font-bold">
              Collection
            </h1>

            <div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full mt-12 mb-16">  
                {collection.map((asset) => (
                    <div 
                        key={asset.asset} 
                        className="my-1 px-1 hover:bg-slate-100 cursor-pointer text-center"
                        onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible, asset.unconfirmed)}
                    >
                        <div className="m-3">
                            <div className="text-sm font-medium text-gray-900">{asset.asset}</div>
                            <div className="text-sm">
                                <div className="text-gray-500 inline-block">Balance: {asset.quantity}</div>
                                {asset.unconfirmed < 0 &&
                                    <div className="inline-block mx-1 text-red-400">
                                    &#40;
                                        {asset.unconfirmed}
                                    &#41;
                                    </div>
                                }
                                {asset.unconfirmed > 0 &&
                                    <div className="inline-block mx-1 text-green-600">
                                    &#40;&#43;
                                        {asset.unconfirmed}
                                    &#41;
                                    </div>
                                }
                            </div>
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



