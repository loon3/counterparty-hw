import lozad from "lozad";
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'
import ModalTemplate from '../components/modal'
import AssetSendForm from '../components/send'
import AssetNavbar from '../components/navbar'
import { useRouter } from 'next/router'
import Image from 'next/image';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { debounce } from "lodash"
import { FixedSizeGrid } from 'react-window';

import { BuildingStorefrontIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

import ReactDOM from "react-dom";

import { useState, useEffect, useCallback, Component, PureComponent, createRef } from "react";
import { recommendedFee, getAssetsFromAddress, getBtcFromAddress, getAddressFromStorage } from '../lib/fetch.js'
import { checkArrayEmpty, classNames, viewToName } from '../lib/util.js'

var Decimal = require('decimal.js-light')


function VirtualCollection(props){
    
    const cardAspectRatio = 414/641
      
    const collection = props.collection
    const columnCount = getColumnCount(props.width)
    
    let assetTotal = props.collection.length
    //add extra whitespace on mobile
    if(props.width < 767){assetTotal++}    

    console.log(columnCount)
    
    const rowCount = Math.ceil(assetTotal / columnCount)
    
    function getColumnCount(width){
        if(width <= 700) return 1;
        else if(width <= 1100) return 2;
        else if(width <= 1600) return 3;
        else if(width <= 2100) return 4;
        return 6;
        
    } 
    
    function displayCardInfo(series, card, directory, artist){
        if(directory != "Other"){
            return "S"+series+" C"+card+" "+directory
        }
        return "Directory Unknown"
    }

    function checkCard(wtf){
        if(!wtf){
            return (<AssetCard front="/notrare.jpeg" back="/cardback.png"/>)
        }
        if(!wtf.mp4){
            return (<AssetCard front={wtf.img_url} back="/cardback.png"/>)
        }

        return (<AssetCard front={wtf.img_url} back="/cardback.png" mp4={wtf.mp4}/>)

    }
    
    class ItemRenderer extends PureComponent {
        
      constructor(props) {
        super(props);
        this.assetCount = Math.ceil(this.props.rowIndex * columnCount)+this.props.columnIndex 
      }
            
      render() { 
        return (
          <div style={this.props.style}>
            {collection[this.assetCount] ? (     
                <div 
                    className={styles.collectionItem}
                >   
                    <div className="mx-2 mt-2 mb-3 text-left">
                        <div className="text-sm font-medium text-stone-800">{collection[this.assetCount].asset}
                        <div className="inline-block float-right text-base text-stone-800"><span className="font-bold">x{collection[this.assetCount].quantity}</span>
                            {collection[this.assetCount].unconfirmed < 0 &&
                                <div className="inline-block mx-1 text-red-400">
                                &#40;
                                    {collection[this.assetCount].unconfirmed}
                                &#41;
                                </div>
                            }
                            {collection[this.assetCount].unconfirmed > 0 &&
                                <div className="inline-block mx-1 text-green-600">
                                &#40;&#43;
                                    {collection[this.assetCount].unconfirmed}
                                &#41;
                                </div>
                            }
                        </div>
                        </div>
                        <div className="text-sm">
                            <div className="text-stone-800 inline-block">
                                {collection[this.assetCount].wtf != null ? (displayCardInfo(collection[this.assetCount].wtf.serie, collection[this.assetCount].wtf.card, collection[this.assetCount].wtf.collectionName, collection[this.assetCount].wtf.artist)):("Directory Unknown")}
                            </div>
                        </div>
                    </div>
                    <div className="m-2">
                        <div className="m-auto">
                            {checkCard(collection[this.assetCount].wtf)}
                        </div>    
                    </div>
                    <div className="ml-1 my-2 h-7 text-center">
                        <div className="text-slate-600 inline-block cursor-pointer" onClick={() => props.handleSend(collection[this.assetCount].asset, collection[this.assetCount].quantity, collection[this.assetCount].divisible, collection[this.assetCount].unconfirmed)}>
                                <PaperAirplaneIcon className="inline-block h-6"/>
                        </div>
                        <div className="float-left inline-block">
                            <a href={`https://xchain.io/asset/${collection[this.assetCount].asset}`} target="_blank" rel="noreferrer" className="text-slate-600 underline underline-offset-2 text-sm">
                                <DocumentTextIcon className="inline-block h-6"/>
                            </a>
                        </div>
                        <div className="float-right inline-block">


                            <a href={`https://pepe.wtf/asset/${collection[this.assetCount].asset}`} target="_blank" rel="noreferrer" className="text-slate-600 underline underline-offset-2 text-sm">
                                <BuildingStorefrontIcon className="inline-block mr-1.5 h-6"/>
                            </a>
                        </div>
                    </div>
                </div>      
            ) : ""}
          </div>
        );   
      }
    }



    return (
      <FixedSizeGrid
        className={styles.newGrid}
        columnCount={columnCount}
        columnWidth={Math.ceil(props.widthMinusScroll/columnCount)-(6/columnCount)}
        height={props.height}
        rowCount={rowCount}
        rowHeight={Math.ceil((Math.ceil((props.width-20)/columnCount))/cardAspectRatio)}
        width={props.width}
      >
        {ItemRenderer}
      </FixedSizeGrid>
    );

    
}


class AssetCard extends Component {
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
        <div>
            <div 
                className={classNames(this.state.isFlipped ? styles.flip:"", styles.flipContainer)}
            >
                <div className={styles.flipper}>
                    <div className={styles.front} onClick={this.handleClick}>
                    {this.props.mp4 ? (
                        <video controls loop className="m-auto" width="800px" height="1120px" preload="none" poster={this.props.front}>
                            <source src={this.props.mp4} type="video/mp4" />
                            Sorry, your browser doesn&#39;t support embedded videos.
                        </video>
                    ):(
                        <LazyLoadImage 
                            src={this.props.front}
                            height="1120"
                            width="800"
                            alt=""
                            effect="blur"
                            visibleByDefault="true"
                        />  
                    )}
                    </div>
                    <div className={styles.back} onClick={this.handleClick}>
                        <LazyLoadImage 
                            src={this.props.back}
                            height="1120"
                            width="800"
                            alt=""
                            effect="blur"
                            visibleByDefault="true"
                        />         
                    </div>
                </div>
            </div>
        </div>

    )
  }
}


export default function CollectionList(props) {
    
    const router = useRouter()
          
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
    const [isCollectionGridLoading, setCollectionGridLoading] = useState(false)  
    const [sendModal, setSendModal] = useState(false)
    

    const resizeHandler = () => {
        setCollectionGridLoading(false);
    }

    const resize = useCallback(
        debounce(resizeHandler, 300)
    , []);
    
    
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
            
        setLoading(true)
        
        const isTxSent = window.sessionStorage.getItem("txSent")
        if(isTxSent){sessionStorage.removeItem('txSent')}
        
        const address = getAddressFromStorage("all")

        if(!address){
            router.push('/settings/select')
        } else {
        
            recommendedFee(function(feeData){

                setFee(feeData)
                console.log(feeData)
                getBtcFromAddress(address.address, function(btc){

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
                })
            })         
        }
        
        window.addEventListener("resize", ()=>{
          //check if mobile device
//          if (!window.matchMedia("(max-width: 767px)").matches){    
              setCollectionGridLoading(true);
              resize()
//          }
        }, false);
    
    }, [])
    
    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )

    if (isCollectionGridLoading) return (
        <PageTemplate address={thisAddress} btc={btcBalance} fee={fee} collection="true">

            <div className="w-full min-w-0 fixed h-[86px] z-10 -mt-1.5">

                <AssetNavbar view={directoryView} setView={(view) => setDirectoryView(view)} setSearch={(query) => setAssetSearch(query)}/>

            </div>
            <div className={styles.main}>Loading...</div>
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


    function filterCollection(collection, view, query){
        
        console.log(view)
        console.log(query)
        
        if(view == "show-all" && query.length == 0){return collection}
        
        let filteredCollection = []
        
        for(const asset of collection){
            if(view == asset.directory || view == "show-all"){
                if((asset.asset).includes(query.toUpperCase())){
                    filteredCollection.push(asset)            
                }
            }
        }
        
        console.log(filteredCollection)
        
        return filteredCollection

    }
  

    return (  
        <PageTemplate address={thisAddress} btc={btcBalance} fee={fee} collection="true">

        <div className="w-full min-w-0 fixed h-[86px] z-10 -mt-1.5">
     
            <AssetNavbar view={directoryView} setView={(view) => setDirectoryView(view)} setSearch={(query) => setAssetSearch(query)}/>
       
        </div>
        <div>
            <AssetSendModal />
        </div>
        <div className="mx-0 md:mx-0">
            {checkArrayEmpty(collection) != true ? (
                <VirtualCollection collection={filterCollection(collection, directoryView, assetSearch)} width={self.innerWidth} widthMinusScroll={document.body.scrollWidth} height={self.innerHeight} handleSend={(asset, balance, divisible, unconfirmed) => handleSend(asset, balance, divisible, unconfirmed)}/>
            ) : (<div className="text-center mt-32"><div className="text-xl pb-16">You don&#39;t have any pepes</div><Image src="/sad-pepe-transparent.png" width="240" height="190" alt="" /></div>)
        }
        </div>
        </PageTemplate>
    )


}

