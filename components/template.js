import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import AssetSendForm from '../components/send'
import ModalTemplate from '../components/modal'
import Image from 'next/image';
import { useState } from "react"
import { useRouter } from 'next/router'

export default function PageTemplate(props) {
    
    return (   
        <div className={styles.container}>
            <Head>
                <title>rpw.wtf</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navigation address={props.address} btc={props.btc} fee={props.fee}/>
            <main className={styles.main}>
                {props.children}
            </main>
            <PageFooter hideLogo={props.hideLogoInFooter}/>
        </div>
    )

}

export function PageFooter(props) {
    return (
            <footer className={styles.footer}>
                {props.hideLogo ? null : (
                <div className="inline-block pl-4">
                    <Image src="/rarefakemerge.gif" height="50px" width="50px" alt=""/>
                </div>  
                )}
                <div className="inline-block pl-4 font-mono font-bold text-white">
                    rpw.wtf
                </div>       
            </footer>
    )
}

export function Navigation(props) {
    
    const router = useRouter()
    
    const [sendModalBtc, setSendModalBtc] = useState(false)
    
    function handleBack(){
        router.push('/connect')
    }
    
    function handleSend(){

        const scrollBarCompensation = window.innerWidth - document.body.offsetWidth;
        document.body.style.paddingRight = `${scrollBarCompensation}px`;       
        document.body.style.overflow = 'hidden';
        
        setSendModalBtc(true)
    }
    

    function handleModalClose(){
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        
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
            <ModalTemplate title="Send BTC">                 
                <AssetSendForm address={props.address} asset="BTC" balance={props.btc.confirmed} btc={props.btc} fee={props.fee}>
                    <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => handleModalClose()}>
                        Close
                    </button>
                </AssetSendForm>
            </ModalTemplate>
          ) : null}
        </>
      )
    }

    if(props.btc) {
        return (   
            <div>
                <BtcSendModal />
                <div className="w-full fixed h-[58px] z-10 border-b-2 border-slate-300 bg-white">
                    <div className="w-full top-4 inline-block pt-4 pr-4 text-center">
                        
                        
                        <div className="float-left">
                            <button className="inline-block bg-white text-black rounded border-2 border-black hover:shadow-md font-bold uppercase text-sm px-2 py-1 -mt-2 mx-4 mb-4 ease-linear transition-all duration-150 select-none" onClick={() => handleBack()}>
                                &larr; Back to Wallet
                            </button>
                        </div>
                        <div className="float-right">
                            <div className={styles.hideAddressInNav}>
                            {props.address.key == "ledger" &&
                            <div className="inline-block align-middle mt-[2px] mr-2"><Image src="/ledger-logo.png" height="20px" width="23px" /></div>
                            }
                            <div className="inline-block font-bold">{props.address.address}</div>
                            <div className="inline-block mx-2"> &#47;&#47; </div>
                            </div>
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
            </div>
        )
    } else if(props.address){
        return (   
                <div className="w-full fixed h-[58px] z-10 border-b-2 border-slate-300 bg-white">
                    <div className="w-full top-4 inline-block pt-4 pr-4">

                        <div className="float-left">
                            <button className="inline-block bg-white text-black border-2 border-black hover:shadow-md font-bold uppercase text-sm px-2 py-1 -mt-2 mx-4 mb-4 ease-linear transition-all duration-150 select-none rounded" onClick={() => handleBack()}>
                                &larr; Back to Wallet
                            </button>
                        </div>
                        <div className="float-right">
                            <div className={styles.hideAddressInNav}>
                            {props.address.key == "ledger" &&
                            <div className="inline-block align-middle mt-[2px] mr-2"><Image src="/ledger-logo.png" height="20px" width="23px" /></div>
                            }
                            <div className="inline-block font-bold">{props.address.address}</div>
                            </div>
                        </div>
                    </div>
                </div>
        )
    } else {
        return (<div></div>)
    } 
                
}
                
