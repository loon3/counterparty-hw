import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import AssetSendForm from '../components/send'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import { useState } from "react"


export default function PageTemplate(props) {
    
    return (   
        <div className={styles.container}>
            <Head>
                <title>Counterparty HW</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navigation address={props.address} btc={props.btc} fee={props.fee}/>
            <main className={styles.main}>
                {props.children}
            </main>
            <footer className={styles.footer}>
                Counterparty HW - Powered by Bitcoin and Counterparty 
            </footer>
        </div>
    )

}

export function Navigation(props) {
    
    const [sendModalBtc, setSendModalBtc] = useState(false)
    
    function handleSend(){
        setSendModalBtc(true)
        disableBodyScroll("BtcSendModal")
    }
    

    function handleModalClose(){
        enableBodyScroll("BtcSendModal")
        const isTxSent = window.sessionStorage.getItem("txSent")
        
        setSendModalBtc(false)
        if(isTxSent){
            window.location.reload()
        } 
    }

    function BtcSendModal() {
      
      return (
        <>
          {sendModalBtc ? (
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
                        Send BTC
                      </h3>
                      
                    </div>
                    <div className="relative p-6 flex-auto">                   
                        <AssetSendForm address={props.address} asset="BTC" balance={props.btc.confirmed} btc={props.btc} fee={props.fee}>
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
  
    if(props.btc) {
        return (   
            <div>
                <BtcSendModal />
                <div className="w-full fixed h-[58px] bg-white z-10">
                    <div className="absolute top-4 right-6 inline-block">
                        <div className="inline-block font-bold">{props.address}</div>
                        <div className="inline-block mx-2"> &#47;&#47; </div>
                        <div className="inline-block cursor-pointer" onClick={() => handleSend()}>{props.btc.confirmed} BTC</div>
                        {props.btc.unconfirmed < 0 &&
                            <div className="inline-block mx-1 text-red-400">
                            &#40;
                                {props.btc.unconfirmed}
                            &#41;
                            </div>
                        }
                        {props.btc.unconfirmed > 0 &&
                            <div className="inline-block mx-1 text-green-600">
                            &#40;&#43;
                                {props.btc.unconfirmed}
                            &#41;
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    } else if(props.address){
        return (   
            <div className="w-full fixed h-[58px] bg-white z-10">
                <div className="absolute top-4 right-6 inline-block">
                    <div className="inline-block font-bold">{props.address}</div>
                </div>
            </div>
        )
    } else {
        return (<div></div>)
    } 
                
}
                
