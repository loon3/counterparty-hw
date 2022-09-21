import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'
import { useRouter } from 'next/router'
import Image from 'next/image';
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';

import ReactDOM from "react-dom";

import { useState, useEffect } from "react";
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress, getAddressFromStorage } from '../lib/fetch.js'
import { checkArrayEmpty } from '../lib/util.js'

var Decimal = require('decimal.js-light')


export default function CollectionList(props) {
    
    const router = useRouter()
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0})
    const [collection, setCollection] = useState(null)
    const [directories, setDirectories] = useState(null)
    const [directoryView, setDirectoryView] = useState(null)
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
              
        const scrollBarCompensation = window.innerWidth - document.body.offsetWidth;
        document.body.style.paddingRight = `${scrollBarCompensation}px`;       
        document.body.style.overflow = 'hidden';
        
    }
    
    function handleDirectory(name){
        console.log(name)
        let nameNoSpaces = name.replace(/\s+/g, '-').toLowerCase()
        setDirectoryView(nameNoSpaces)
    }
    

    function handleModalClose(){
        document.body.style.overflow = '';
        document.body.style.paddingRight = ''
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        
        setSendModal(false)
        if(isTxSent){
            window.location.reload()
        } 
    }
    
    function getDirectoryNameNoSpaces(directoryName){
        const directoryNameNoSpaces = directoryName.replace(/\s+/g, '-').toLowerCase()
        return directoryNameNoSpaces
    }

    function AssetSendModal() {
      
      return (
        <>
          {sendModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
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
              <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
            </>
          ) : null}
        </>
      )
    }
    
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [directoryView])
  
    useEffect(() => {
        
        setLoading(true)
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        if(isTxSent){sessionStorage.removeItem('txSent')}
        
        const address = getAddressFromStorage()
//FOR TESTING...
//        const address = "1AtcSh7uxenQ6AR5xqr6agAegWRUF5N4uh"
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
                        
                        
                        let firstDirectory = null
                        if(res.directories[0]){firstDirectory = res.directories[0].replace(/\s+/g, '-').toLowerCase()}
                        setDirectoryView(firstDirectory)
                        setDirectories(res.directories)

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
//                    asset.wtf != null ? ( 
//                    ) : null

//            <h1 className="text-4xl font-bold">
//              Collection
//            </h1>

    

    return (  
        <PageTemplate address={thisAddress} btc={btcBalance} fee={fee} directories={directories}>

        <div className="w-full fixed mt-[10px] pt-[22px] h-[138px] md:h-[86px] z-10 top-12 text-center border-b-4 border-green-800 bg-white">
        {directories.map((directoryName) => (
             <button key={directoryName} className={`${styles.directoryBtn} ${directoryView == getDirectoryNameNoSpaces(directoryName) ? (styles.directoryBtnActive):("")}`} onClick={() => handleDirectory(directoryName)}>
                {directoryName}
            </button>
        ))}
        </div>
        <div>
            <AssetSendModal />
        </div>

            {checkArrayEmpty(collection) != true ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 w-full mt-20 pt-12 mb-16">  
                    {collection.map((asset) => (
                        <div 
                            key={asset.asset} 
                            className={`${directoryView != asset.directory ? ("hidden"):("")} ${styles.collectionItem}`}
                            onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible, asset.unconfirmed)}
                        >      
                            <div className="m-3">
                                <div className="m-auto">
                                    <LazyLoadImage 
                                        src={asset.wtf != null ? (asset.wtf.img_url):("/notrare.jpeg")}
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

                    ))}
                </div>
            ) : (<div className="text-center"><div className="text-xl pb-16">You don&#39;t have any pepes</div><Image src="/feels-bad-man-frog.gif" height="250" width="250" alt="" /></div>)
        }
        </PageTemplate>
    )

}



