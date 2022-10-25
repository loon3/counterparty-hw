import styles from '../styles/Home.module.css'
import Link from 'next/link'
import React from 'react';
import PageTemplate from '../components/template'
import AssetSendForm from '../components/send'
import ModalTemplate from '../components/modal'
import Image from 'next/image';
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";

import { useState, useEffect } from "react";
import { getAddressFromStorage, recommendedFee, getBtcFromAddress } from '../lib/fetch.js'

import { useRouter } from 'next/router'

import { QrCodeIcon, PencilSquareIcon, WrenchScrewdriverIcon, BookOpenIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'

var Decimal = require('decimal.js-light')



export default function ConnectLandingPage() {
    
    
    const router = useRouter()
      
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(true)
    
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0, firstHalfBalance: "0.0000", secondHalfBalance: "0000"})
    const [fee, setFee] = useState(0)
    
    const [qrModal, setQrModal] = useState(false)   
    const [sendModalBtc, setSendModalBtc] = useState(false)
    
    function handleSendModal(){

//        const scrollBarCompensation = window.innerWidth - document.body.offsetWidth;
//        document.body.style.paddingRight = `${scrollBarCompensation}px`;       
//        document.body.style.overflow = 'hidden';
        
        recommendedFee(function(feeData){
            console.log(feeData)
            setFee(feeData)
            setSendModalBtc(true)
            
        })
    }
    
    
    function handleQrModal(){
        console.log("qr")
        setQrModal(true)
    }

    function handleSendModalClose(){
//        document.body.style.overflow = ''
//        document.body.style.paddingRight = ''
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        
        setSendModalBtc(false)
        if(isTxSent){
            window.location.reload()
        } 
    }
    
    function handleQrModalClose(){
//        document.body.style.overflow = ''
//        document.body.style.paddingRight = ''
          
        setQrModal(false)
        
    }

    function BtcSendModal() {
      
      return (
        <>
          {sendModalBtc ? (
            <ModalTemplate title="Send BTC">                 
                <AssetSendForm address={thisAddress} asset="BTC" balance={btcBalance.confirmed} btc={btcBalance} imgUrl="/bitcoin-logo.png" supply="21000000" fee={fee}>
                    <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => handleSendModalClose()}>
                        Close
                    </button>
                </AssetSendForm>
            </ModalTemplate>
          ) : null}
        </>
      )
    }
    
    function QrDepositModal() {
      
      return (
        <>
          {qrModal ? (
            <ModalTemplate title="Deposit">  
                <div className="text-center">
                    <QRCode className="m-auto my-2" value={thisAddress.address} />
                    <div className="text-lg font-bold my-4 break-all">{thisAddress.address}</div>
                    <button className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mt-1 ease-linear transition-all duration-150" onClick={() => handleQrModalClose()}>
                        Close
                    </button> 
                </div>
            </ModalTemplate>
          ) : null}
        </>
      )
    }

    useEffect(() => {

        const address = getAddressFromStorage("all")
        if(!address){
            router.push('/settings/select')
        } else {
            setAddress(address)

            getBtcFromAddress(address.address, function(btc){

                console.log(btc)
                const confirmedFromSats = new Decimal(btc.balance).dividedBy(1e8).toNumber()
                const unconfirmedFromSats = new Decimal(btc.unconfirmed_balance).dividedBy(1e8).toNumber()

                const firstHalfBalance = confirmedFromSats.toFixed(8).toString().slice(0, -4)
                const secondHalfBalance = confirmedFromSats.toFixed(8).toString().slice(-4)

                setBtcBalance({confirmed: confirmedFromSats, unconfirmed: unconfirmedFromSats, firstHalfBalance: firstHalfBalance, secondHalfBalance: secondHalfBalance})

                setLoading(false)
            })

            
        }
              
    }, [])

    if (isLoading) return (
        <PageTemplate type="centeredFull">
            <div className={styles.centered}><Image src="/spinning-logo.gif" width="100" height="100" alt="" /></div>
        </PageTemplate>
    )

    if (!thisAddress) return (
        <PageTemplate>
            <div>{error}</div>
        </PageTemplate>
    )
    
//                <div className="block sm:h-[36px] sm:w-[36px] h-[24px] w-[24px] m-auto">
//                    <Image src="/btc-icon.png" height="36px" width="36px" />
//                </div>
    
    return (  
        <PageTemplate address={thisAddress} btc={btcBalance} hideLogoInFooter hideNav darkBg>
        <BtcSendModal />
        <QrDepositModal />
        <div className="pb-6">
            <Image src="/rarefakemerge.gif" height="100px" width="100px" alt=""/>
        </div>
        <div className="text-center">
            <h1 className="text-xl sm:text-3xl font-bold">
              Wallet Address
            </h1>

            <div className="text-lg sm:text-2xl text-center">
                {thisAddress.key == "ledger" &&
                    <div className="inline-block mr-2 align-middle -mt-[2px] select-none"><Image src="/ledger-logo-stone.png" height="20px" width="23px" /></div>
                }
                <div className="inline-block break-all">{thisAddress.address}</div>
            </div>
        </div>
            <div className="text-center my-12 p-2" onClick={() => handleSendModal()}>

                <div className="text-5xl sm:text-8xl block mx-2 break-all">
                    {btcBalance.firstHalfBalance}<span className="text-2xl sm:text-4xl">{btcBalance.secondHalfBalance}</span>
                </div>
                {btcBalance.unconfirmed < 0 &&
                    <div className="inline-block my-1 text-red-400">
                    &#40;
                        {btcBalance.unconfirmed}
                    &#41;
                    </div>
                }
                {btcBalance.unconfirmed > 0 &&
                    <div className="inline-block my-1 text-green-600">
                    &#40;&#43;
                        {btcBalance.unconfirmed}
                    &#41;
                    </div>
                }
                <div className="block sm:text-2xl text-lg font-bold">
                    BTC
                </div>

            </div>
        
         
      
     
        
         <div className="grid grid-cols-2 gap-10 sm:gap-8 sm:grid-cols-3 lg:grid-cols-4">
        <Link href="/collection">
        <div className="col-span-2 lg:col-span-4 justify-center p-4 sm:p-8 rounded-xl border-2 border-[#5ac545] text-[#5ac545] cursor-pointer">
            <div><BookOpenIcon className="h-16 m-auto"/></div>
            <div className="text-center text-lg">View Collection</div>
          </div>
        </Link>
          <div className="col-span-1 justify-center p-4 sm:p-8 rounded-xl border-2 border-[#5ac545] text-[#5ac545] cursor-pointer" onClick={() => handleQrModal()}>
            <div><QrCodeIcon className="h-16 m-auto"/></div>
            <div className="text-center text-lg">Deposit</div>
          </div>
        <a href="https://pepe.wtf/market" target="_blank" rel="noopener noreferrer">
          <div className="col-span-1 justify-center p-4 sm:p-8 rounded-xl border-2 border-[#5ac545] text-[#5ac545] cursor-pointer">
            <div><BuildingStorefrontIcon className="h-16 m-auto"/></div>
            <div className="text-center text-lg">Market</div>
          </div>
        </a>
        <Link href="/sign">
          <div className="col-span-1 justify-center p-4 sm:p-8 rounded-xl border-2 border-[#5ac545] text-[#5ac545] cursor-pointer">
        
            <div><PencilSquareIcon className="h-16 m-auto"/></div>
            <div className="text-center text-lg">Sign</div>
          </div>
        </Link>
        <Link href="/settings">
          <div className="col-span-1 justify-center p-4 sm:p-8 rounded-xl border-2 border-[#5ac545] text-[#5ac545] cursor-pointer">
            <div><WrenchScrewdriverIcon className="h-16 m-auto"/></div>
            <div className="text-center text-lg">Settings</div>
          </div>
        </Link>
          
        </div>
        
        
              
           
        </PageTemplate>
    )
}

//<div className={styles.grid}>
//<Link href="/collection">
//<a href="#" className={styles.card}>
//<h3>View Collection &rarr;</h3>
//</a>
//</Link>
//
//<Link href="/sign">
//<a href="#" className={styles.card}>
//<h3>Sign Message &rarr;</h3>
//</a>
//</Link>
//
//<Link href="/settings">
//<a href="#" className={styles.card}>
//<h3>Settings &rarr;</h3>
//</a>
//</Link>
//
//</div>
