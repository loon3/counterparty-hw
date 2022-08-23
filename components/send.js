import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'

import { useState, useEffect } from "react";
import { createTxSendAssetOpreturn, createTxSendBtc } from "../lib/xcp.js"
import { getHexFromUtxo, pushTx } from "../lib/fetch.js"
import { sendAssetLedger } from '../lib/ledger.js'

var Decimal = require('decimal.js-light')


export default function AssetSendForm(props) {
      
  const [isSent, setSent] = useState("init")
  const [status, setStatus] = useState("Preparing to Send...")
  const [btcData, setBtcData] = useState(null)
  const [xcpData, setXcpData] = useState(null)
  const [txid, setTxid] = useState(null)
  
  const btcConf = new Decimal(props.btc.confirmed).toDecimalPlaces(8).times(1e8)
  const btcUnconf = new Decimal(props.btc.unconfirmed).toDecimalPlaces(8).times(1e8)
  const btcBalanceSatoshis = btcConf.plus(btcUnconf).toNumber(); 
    
  function handlePushTx(inputData, parsedData){
      getHexFromUtxo(parsedData.inputs, function(hexData){
        setStatus("Sending transaction to device for signing...")
        let btcDataWithHex = {address: inputData.fromAddress, tx: parsedData.tx, inputs: parsedData.inputs, inputsWithHex: hexData}
        console.log(btcDataWithHex)
        setBtcData(btcDataWithHex)

        sendAssetLedger(btcDataWithHex, function(response){
            if(response.status == "success"){
                pushTx(response.message, function(txid){
                    setTxid(txid)
                    setSent("sent")
                })
            } else if(response.status == "error"){
                setStatus(response.message)
            } else {
                setStatus("Something went wrong.")
            }            
        })

      })
  }    
 
  const handleSubmit = (event) => {
 
    event.preventDefault()
      
    setSent("sending") 
      
    const txFeeSatoshis = new Decimal(event.target.txfee.value).toDecimalPlaces(8).times(1e8).toNumber();  
      
    const data = {
      fromAddress: window.sessionStorage.getItem("address"),
      asset: props.asset,
      balance: props.balance,    
      toAddress: event.target.address.value,
      amount: event.target.amount.value,
      divisible: props.divisible,
      txFeeSatoshis: txFeeSatoshis
    }
    
    setXcpData(data)
      
    console.log(btcBalanceSatoshis)
    console.log(txFeeSatoshis)    
    
    let btcTotal = txFeeSatoshis  
    if(data.asset == "BTC"){       
        data.amount = new Decimal(data.amount).toDecimalPlaces(8).times(1e8).toNumber(); 
        btcTotal += data.amount
    }
      
      
    let stopSend = false  
    if (btcBalanceSatoshis == 0 || btcBalanceSatoshis < btcTotal){
        stopSend = true
        setStatus("Not enough BTC to complete the transaction.")
    }
    if(txFeeSatoshis < process.env.minFeeSatoshis){
        stopSend = true
        let minFee = process.env.minFeeSatoshis / 100000000
        let statusMessage = "Fee is too low, must be at least "+minFee+" BTC"
        setStatus(statusMessage)
    }
      
//    stopSend = true
//    setSent("sent")  
     
    if(!stopSend){
        if(data.asset != "BTC"){
            createTxSendAssetOpreturn(data, function(res){ handlePushTx(data, res) })
        } else {
            createTxSendBtc(data, function(res){ handlePushTx(data, res) })
        }
    }    
      
  }
  
  if (isSent == "sending") return (
        <div className="mb-10">{status}</div>
  )
  
  if (isSent == "sent") return (
        <AssetSendFormSent xcpData={xcpData} btcData={btcData} txid={txid}/>
  )
  
  let availableBalance = props.balance
  if(props.asset == "BTC"){ availableBalance = new Decimal(btcBalanceSatoshis).dividedBy(1e8).toNumber()}
    
  return (
  
    <div id="sendForm">  
      <div className="w-[32rem] bg-slate-100 px-5 py-8 rounded-lg my-8">
        <h1 className="text-3xl font-bold text-center">
            Send {props.asset}
        </h1>  
        <div className="mt-4">              
            <h3 className="text-xl text-center text-gray-500">Available Balance: {availableBalance}</h3>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mt-14">
                <label htmlFor="address" className="block">Receiver Address</label>
                <input type="text" name="address" id="address" className="pl-2 mt-1 w-full border-2 border-slate-400 rounded-md" defaultValue="" required />
            </div>
            <div className="mt-10">
                <label htmlFor="amount" className="block">Amount to Send</label>
                <input type="text" name="amount" id="amount" className="pl-2 mt-1 w-full border-2 border-slate-400 rounded-md" defaultValue="" required />
            </div>
            <div className="mt-10">
                <label htmlFor="txfee" className="block">Bitcoin Tx Fee</label>
                <input type="text" name="txfee" id="txfee" className="pl-2 mt-1 w-full border-2 border-slate-400 rounded-md" defaultValue={props.fee} required />
                <div className="text-xs text-gray-500 text-left">(Suggested fee shown above)</div>
            </div>
            <div className="mt-12 text-center">
                <div className="w-80 justify-center inline-flex">Unlock your Ledger device and open the Bitcoin app before clicking send</div>
            </div>  
            <div className="mt-12 text-center">
                <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Send</button>
            </div>  
        </form>  
      </div>  
      <div className="text-center">{props.children}</div>
    </div>
    


  )
}

export function AssetSendFormSent(props) {

    const router = useRouter()    

    function handleBack(){    
        if(props.xcpData.asset == "BTC"){
            router.push('/collection')
        } else {
            window.location.reload()
        }
    }

    let url = "https://xchain.io/tx/"+props.txid
    let urlTitle = "XChain"
    if(props.xcpData.asset == "BTC"){
        url = "https://mempool.space/tx/"+props.txid
        urlTitle = "Mempool"
    }

    return (
        <div className="w-full">
            <div className="text-center">
                <div className="mb-6 text-2xl font-bold">Transaction sent!</div>
                <div className="mb-10 text-sky-500"><a href={url} target="_blank" rel="noreferrer">View on {urlTitle}</a></div>
            </div>
            <div className="text-center">
                <button onClick={() => handleBack()} className={styles.card}>
                    <p>&larr; Back to Collection</p>
                </button>
            </div>
        </div>
    )

}

