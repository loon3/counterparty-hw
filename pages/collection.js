import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'
import { useRouter } from 'next/router'
import Image from 'next/image';
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress, getAddressFromStorage } from '../lib/fetch.js'

var Decimal = require('decimal.js-light')


export default function CollectionList(props) {
    
    const router = useRouter()
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0})
    const [collection, setCollection] = useState(null)
    const [sendData, setSendData] = useState(null)
    const [fee, setFee] = useState(null)
    
    const [isLoading, setLoading] = useState(false)  
    const [sendModal, setSendModal] = useState(false)
    
    function handleSend(asset, balance, divisible, unconfirmed){
        
        const balConf = new Decimal(balance)
        const balUnconf = new Decimal(unconfirmed)
        const finalBalance = balConf.plus(balUnconf).toNumber();
 
        setSendData({asset: asset, balance: finalBalance, divisible: divisible})
        setSendModal(true)
        disableBodyScroll("AssetSendModal")
    }
    

    function handleModalClose(){
        enableBodyScroll("AssetSendModal")
        const isTxSent = window.sessionStorage.getItem("txSent")
        
        setSendModal(false)
        if(isTxSent){
            window.location.reload()
        } 
    }

    function AssetSendModal() {
      
      return (
        <>
          {sendModal ? (
            <>
              <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              >
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 bg-black rounded-t">
                      <h3 className="text-3xl font-semibold text-white">
                        Send {sendData.asset}
                      </h3>
                      
                    </div>
                    <div className="relative p-6 flex-auto">
                        <AssetSendForm asset={sendData.asset} balance={sendData.balance} divisible={sendData.divisible} fee={fee} btc={btcBalance}>
                            <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => handleModalClose()}>
                                Close
                            </button>
                        </AssetSendForm>
                    </div>
                    
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </>
      )
    }
  
    useEffect(() => {
        
        setLoading(true)
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        if(isTxSent){sessionStorage.removeItem('txSent')}
        
        const address = getAddressFromStorage()
//FOR TESTING...
//        const address = "1Kvddk8d9HywrXjpFUTxuPwgHgm2Cdc9h9"
        if(!address){
            router.push('/settings/select-address')
        } else {
        
            recommendedFee(function(feeData){
//FOR TESTING...
//                const feeData = 0.00000747
                setFee(feeData)
                console.log(feeData)
                getBtcFromAddress(address, function(btc){
//FOR TESTING...
//                    const btc = {
//                                  "address": "1Kvddk8d9HywrXjpFUTxuPwgHgm2Cdc9h9",
//                                  "total_received": 143028,
//                                  "total_sent": 128165,
//                                  "balance": 14863,
//                                  "unconfirmed_balance": 0,
//                                  "final_balance": 14863,
//                                  "n_tx": 70,
//                                  "unconfirmed_n_tx": 0,
//                                  "final_n_tx": 70
//                                }
                    console.log(btc)
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

    return (  
        <PageTemplate address={thisAddress} btc={btcBalance} fee={fee}>
            <h1 className="text-4xl font-bold">
              Collection
            </h1>
        
        <div>
            <AssetSendModal />
        </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 w-full mt-12 mb-16">  
                {collection.map((asset) => (
                    asset.wtf != null ? (           
                        <div 
                            key={asset.asset} 
                            className={styles.collectionItem}
                            onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible, asset.unconfirmed)}
                        >      
                            <div className="m-3">
                                <div className="m-auto">
                                    <LazyLoadImage
                                        src={asset.wtf.img_url}
                                        height="560"
                                        width="400"
                                        alt={asset.asset}
                                        effect="blur"
                                    />               
                                </div>
                            </div>
                            <div className="m-1">
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
                    ) : null
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



