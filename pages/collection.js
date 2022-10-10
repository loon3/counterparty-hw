import lozad from "lozad";
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import ModalTemplate from '../components/modal'
import AssetSendForm from '../components/send'
import AssetNavbar from '../components/navbar'
import { useRouter } from 'next/router'
import Image from 'next/image';
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { BuildingStorefrontIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

import ReactDOM from "react-dom";

import { useState, useEffect, Component } from "react";
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress, getAddressFromStorage } from '../lib/fetch.js'
import { checkArrayEmpty, classNames, viewToName } from '../lib/util.js'

var Decimal = require('decimal.js-light')

import ReactCardFlip from 'react-card-flip';


class AssetCardFlip extends Component {
  constructor(props) {
    super(props);
      this.state = {
      isFlipped: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
  }

  render() {
    return (
      <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal" flipSpeedBackToFront="1" flipSpeedFrontToBack="1">
        <div onClick={this.handleClick}>
        {this.props.mp4 ? (
            <video controls loop className="lozad m-auto" width="400px" height="560px" preload="none" poster="/card-placeholder.png" data-poster={this.props.front}>
                <source data-src={this.props.mp4} type="video/mp4" />
                Sorry, your browser doesn't support embedded videos.
            </video>
        ):(
            <img 
                src="/card-placeholder.png"
                data-src={this.props.front}
                className="lozad m-auto border-0 outline-none"
                height="560"
                width="400"
                
            />  
        )}
        </div>
        <div onClick={this.handleClick}>
            <img 
                data-src={this.props.back}
                className="lozad m-auto"
                height="560"
                width="400"
                
            />         
        </div>
      </ReactCardFlip>
    )
  }
}


export default function CollectionList(props) {
    
    const router = useRouter()
    //const { observe } = lozad();
    

          
    const [error, setError] = useState(null)
    const [thisAddress, setAddress] = useState(null)
    const [btcBalance, setBtcBalance] = useState({confirmed: 0, unconfirmed: 0})
    const [collection, setCollection] = useState(null)
    const [directories, setDirectories] = useState(null)
    const [directoryView, setDirectoryView] = useState("show-all")
    const [assetSearch, setAssetSearch] = useState("")
    const [sendData, setSendData] = useState({asset: null, balance: null, divisible: null})
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
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        
        setSendModal(false)
        if(isTxSent){
            
            setLoading(true)       
            getBtcFromAddress(thisAddress.address, function(btc){

                    console.log(btc)
                    const confirmedFromSats = new Decimal(btc.balance).dividedBy(1e8).toNumber()
                    const unconfirmedFromSats = new Decimal(btc.unconfirmed_balance).dividedBy(1e8).toNumber()
                    setBtcBalance({confirmed: confirmedFromSats, unconfirmed: unconfirmedFromSats})

                    getAssetsFromAddress(thisAddress.address, function(res) {  
                         
                        console.log(res)
                        
                        setCollection(res.data)
                        setLoading(false)                      

                    })  
                })
            
        } 
    }
    
    function getDirectoryNameNoSpaces(directoryName){
        const directoryNameNoSpaces = directoryName.replace(/\s+/g, '-').toLowerCase()
        return directoryNameNoSpaces
    }
    
    function checkIfAssetShown(asset){
        if(asset.directory == directoryView || directoryView == "show-all"){
            
            if((asset.asset).includes(assetSearch.toUpperCase())){
                return true
            } else {
                return false
            }

        }
    }

    function AssetSendModal() {
        
      const title = "Send "+sendData.asset
      
      return (
        <>
          {sendModal ? (
            <ModalTemplate title={title}>
                <AssetSendForm address={thisAddress} asset={sendData.asset} balance={sendData.balance} divisible={sendData.divisible} fee={fee} btc={btcBalance}>
                    <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => handleModalClose()}>
                        Close
                    </button>
                </AssetSendForm>
            </ModalTemplate>
          ) : null}
        </>
      )
    }
    
    useEffect(() => {
        const { observe } = lozad('.lozad', {
            loaded: el => {
                el.classList.add(styles.fade);
            }
        });
        observe();
    }, [isLoading])
    
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [directoryView])
  
    useEffect(() => {
            
        setLoading(true)
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        if(isTxSent){sessionStorage.removeItem('txSent')}
        
        const address = getAddressFromStorage("all")

        if(!address){
            router.push('/settings/select')
        } else {
        
//            recommendedFee(function(feeData){
//FOR TESTING...
                const feeData = 0.00000747
                setFee(feeData)
                console.log(feeData)
//                getBtcFromAddress(address.address, function(btc){
//FOR TESTING...
                    const btc = {
                                  "address": "1Kvddk8d9HywrXjpFUTxuPwgHgm2Cdc9h9",
                                  "total_received": 143028,
                                  "total_sent": 128165,
                                  "balance": 14863,
                                  "unconfirmed_balance": 0,
                                  "final_balance": 14863,
                                  "n_tx": 70,
                                  "unconfirmed_n_tx": 0,
                                  "final_n_tx": 70
                                }
                    console.log(btc)
                    const confirmedFromSats = new Decimal(btc.balance).dividedBy(1e8).toNumber()
                    const unconfirmedFromSats = new Decimal(btc.unconfirmed_balance).dividedBy(1e8).toNumber()
                    setBtcBalance({confirmed: confirmedFromSats, unconfirmed: unconfirmedFromSats})

                    getAssetsFromAddress(address.address, function(res) {  
                         
                        console.log(res)
                        

                        setDirectories(res.directories)

                        setCollection(res.data)
                        setAddress(address)
                        setLoading(false)                      

                    })  
//                })
//            })         
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




//className={`${checkIfAssetShown(asset) ? (""):("hidden")} ${styles.collectionItem}`}
    function displayCardInfo(series, card, directory, artist){
        if(directory != "Other"){
            return "S"+series+" C"+card+" "+directory
        }
        return "Directory Unknown"
    }

    function checkCard(wtf){
        if(!wtf){
            return (<AssetCardFlip front="/notrare.jpeg" back="/cardback.png"/>)
        }
        if(!wtf.mp4){
            return (<AssetCardFlip front={wtf.img_url} back="/cardback.png"/>)
        }

        return (<AssetCardFlip front={wtf.img_url} back="/cardback.png" mp4={wtf.mp4}/>)

    }
        

//                                <div className="m-auto cursor-pointer" onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible, asset.unconfirmed)}>
//                                    <LazyLoadImage 
//                                        src={asset.wtf != null ? (asset.wtf.img_url):("/notrare.jpeg")}
//                                        height="560"
//                                        width="400"
//                                        alt={asset.asset}
//                                        effect="blur"
//                                    />               
//                                </div>

    return (  
        <PageTemplate address={thisAddress} btc={btcBalance} fee={fee} collection="true">

        <div className="w-full min-w-0 fixed h-[86px] z-10 -mt-1.5">
     
            <AssetNavbar view={directoryView} setView={(view) => setDirectoryView(view)} setSearch={(query) => setAssetSearch(query)}/>
       
        </div>
        <div>
            <AssetSendModal />
        </div>
        <div className="mx-1 md:mx-6">
            {checkArrayEmpty(collection) != true ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 w-full mt-10 pt-14 mb-16">  
                    {collection.map((asset) => (
                        <div 
                            key={asset.asset} 
                            className={classNames(checkIfAssetShown(asset) ? "":"hidden", styles.collectionItem)}
                        >   
                            <div className="mx-2 mt-2 mb-3 text-left">
                                <div className="text-sm font-medium text-stone-800">{asset.asset}
                                <div className="inline-block float-right text-base text-stone-800"><span className="font-bold">x{asset.quantity}</span>
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
                                <div className="text-sm">
                                    <div className="text-stone-800 inline-block">
                                        {asset.wtf != null ? (displayCardInfo(asset.wtf.serie, asset.wtf.card, asset.wtf.collectionName, asset.wtf.artist)):("Directory Unknown")}
                                    </div>
                                </div>
                            </div>
                            <div className="m-2">
                                <div className="m-auto">
                                    {checkCard(asset.wtf)}
                                </div>    
                            </div>
                            <div className="ml-1 my-2 h-7 text-center">
                                <div className="text-slate-600 inline-block cursor-pointer" onClick={() => handleSend(asset.asset, asset.quantity, asset.divisible, asset.unconfirmed)}>
                                        <PaperAirplaneIcon className="inline-block h-6"/>
                                </div>
                                <div className="float-left inline-block">
                                    <a href={`https://xchain.io/asset/${asset.asset}`} target="_blank" rel="noreferrer" className="text-slate-600 underline underline-offset-2 text-sm">
                                        <DocumentTextIcon className="inline-block h-6"/>
                                    </a>
                                </div>
                                <div className="float-right inline-block">


                                    <a href={`https://pepe.wtf/asset/${asset.asset}`} target="_blank" rel="noreferrer" className="text-slate-600 underline underline-offset-2 text-sm">
                                        <BuildingStorefrontIcon className="inline-block mr-1.5 h-6"/>
                                    </a>
                                </div>
                            </div>
                        </div>    

                    ))}
                </div>
            ) : (<div className="text-center mt-32"><div className="text-xl pb-16">You don&#39;t have any pepes</div><Image src="/feels-bad-man-frog.gif" height="250" width="250" alt="" /></div>)
        }
        </div>
        </PageTemplate>
    )

}



