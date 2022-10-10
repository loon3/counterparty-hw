import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'

import { useState, useEffect } from "react";
import { createTxSendAssetOpreturn, createTxSendBtc, getPrivkeyFromPassphrase, createTxSendAssetOpreturnPsbt, createTxSendBtcPsbt } from "../lib/xcp.js"
import { getHexFromUtxo, pushTx, getAddressFromStorage, getPassphraseFromStorage } from "../lib/fetch.js"
import { sendAssetLedger } from '../lib/ledger.js'

var Decimal = require('decimal.js-light')


export default function AssetSendForm(props) {
      
  const [isSent, setSent] = useState("init")
  const [status, setStatus] = useState("Preparing to Send...")
  const [btcData, setBtcData] = useState(null)
  const [xcpData, setXcpData] = useState({
                                  fromAddress: null,
                                  fromFormat: null,
                                  fromDerivationPath: null,    
                                  asset: null,
                                  balance: null,    
                                  toAddress: null,
                                  amount: null,
                                  divisible: null,
                                  txFeeSatoshis: null,
                                  privkey: null
                                })
  const [txid, setTxid] = useState(null)
  
  const btcConf = new Decimal(props.btc.confirmed).toDecimalPlaces(8).times(1e8)
  const btcUnconf = new Decimal(props.btc.unconfirmed).toDecimalPlaces(8).times(1e8)
  const btcBalanceSatoshis = btcConf.plus(btcUnconf).toNumber(); 
    
  function handleLedgerTx(inputData, parsedData){
      getHexFromUtxo(parsedData.inputs, function(hexData){
        setStatus("Sending transaction to device for signing...")
        let btcDataWithHex = {address: inputData.fromAddress, format: inputData.fromFormat, derivationPath: inputData.fromDerivationPath, tx: parsedData.tx, inputs: parsedData.inputs, inputsWithHex: hexData}
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
    
  function handlePassphraseTx(data){
      
      setSent("sending")
      
      if(data.asset == "BTC"){
        createTxSendBtcPsbt(data, function(res){ 
            setStatus("Sending transaction...")
            pushTx(res.tx, function(txid){
                setTxid(txid)
                setSent("sent")
            }) 
        })
      } else {
        createTxSendAssetOpreturnPsbt(data, function(res){ 
            setStatus("Sending transaction...")
            pushTx(res.tx, function(txid){
                setTxid(txid)
                setSent("sent")
            })
        })
      }
  }
 
  const handleSubmit = (event) => {
 
    event.preventDefault()
      
    setSent("sending") 
      
    const txFeeSatoshis = new Decimal(event.target.txfee.value).toDecimalPlaces(8).times(1e8).toNumber();  
      
    const fromAddress = props.address  
      
    const data = {
      fromAddress: fromAddress.address,
      fromFormat: fromAddress.format,
      fromDerivationPath: fromAddress.derivationPath,    
      asset: props.asset,
      balance: props.balance,    
      toAddress: event.target.address.value,
      amount: event.target.amount.value,
      divisible: props.divisible,
      txFeeSatoshis: txFeeSatoshis,
      privkey: null
    }
    
    if(fromAddress.key == "passphrase"){data.privkey = getPrivkeyFromPassphrase(getPassphraseFromStorage(), fromAddress)}
    
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
      
    setXcpData(data)
        
//    stopSend = true
//    setSent("sent")  

    if(!stopSend){
        if(data.asset != "BTC"){
            if(fromAddress.key == "ledger"){
                createTxSendAssetOpreturn(data, function(res){ handleLedgerTx(data, res) })
            }
            if(fromAddress.key == "passphrase"){
                setSent("confirm")
            }
        } else {
            if(fromAddress.key == "ledger"){
                createTxSendBtc(data, function(res){ handleLedgerTx(data, res) })
            }
            if(fromAddress.key == "passphrase"){
                setSent("confirm")
            }
        }
    }    
      
  }
  
  if (isSent == "sending") return (
        <div>
            <div className="w-full px-5 pt-12 pb-8 my-2 text-center">{status}</div>
            <div className="mt-12 pt-6 w-full border-t border-solid border-slate-200">
                <div className="text-center float-right">
                    <div className="inline-flex text-center">{props.children}</div>
                </div>
            </div>
        </div>
  )
    
  if (isSent == "confirm") return (
        <div>
            <div className="w-full px-5 pt-12 pb-8 my-2 text-center">
                <div className="text-md text-center text-lg">Are you sure you want to send <div className="font-bold text-lg my-3">{xcpData.asset == "BTC" ? (new Decimal(xcpData.amount).toDecimalPlaces(8).dividedBy(1e8).toNumber()) : (xcpData.amount)} {xcpData.asset}</div> to <div className="font-bold text-lg my-3 break-all">{xcpData.toAddress}</div> &#63;</div>
            </div>
            <div className="mt-12 pt-6 w-full border-t border-solid border-slate-200">
                <div className="text-center float-right">
                    <div className="inline-flex text-center">{props.children}</div>

                        <button className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={() => handlePassphraseTx(xcpData)}>
                            Confirm Send
                        </button>
                    
                </div>
            </div>
        </div>
  )
  
  if (isSent == "sent") return (
      <AssetSendFormSent xcpData={xcpData} btcData={btcData} txid={txid}>
        <div className="mt-12 pt-6 w-full border-t border-solid border-slate-200">
            <div className="text-center float-right">
                <div className="inline-flex text-center">{props.children}</div>
            </div>
        </div>
      </AssetSendFormSent>
  )
  
  let availableBalance = props.balance
  if(props.asset == "BTC"){ availableBalance = new Decimal(btcBalanceSatoshis).dividedBy(1e8).toNumber()}
    
  return (
  
    <div id="sendForm">  
      <div className="w-full pt-4 pb-8 rounded-lg my-2">
 
        <div className="mt-1">              
            <h3 className="text-md text-center text-gray-500">Available Balance:</h3>
            <h1 className="text-4xl text-center font-semibold">{availableBalance}</h1>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mt-10">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Receiver Address</label>
                <div className="flex">
                    <input type="text" name="address" id="address" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" defaultValue="" required />
                </div>
            </div>
            <div className="mt-10">
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount to Send</label>
                <input type="text" name="amount" id="amount" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" defaultValue="" required />
            </div>
            <div className="mt-10">
                <label htmlFor="txfee" className="block text-gray-700 text-sm font-bold mb-2">Bitcoin Tx Fee</label>
                <input type="text" name="txfee" id="txfee" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" defaultValue={props.fee} required />
                <div className="text-xs text-gray-500 text-left">(Suggested fee shown above)</div>
            </div>
            {props.address.key == "ledger" &&
            <div className="mt-12 text-center">
                <div className="w-80 justify-center inline-flex">Unlock your Ledger device and open the Bitcoin app before clicking send</div>
            </div>          
            }
            <div className="mt-12 pt-6 w-full border-t border-solid border-slate-200">
            <div className="text-center float-right">
                <div className="inline-flex text-center">{props.children}</div>

                <button className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Send
                </button>
            </div>  
            </div>
        </form>  
      </div>  
      
    </div>
    


  )
}


export function AssetSendFormSent(props) {

    const router = useRouter()    

    sessionStorage.setItem("txSent", true)

    let url = "https://xchain.io/tx/"+props.txid
    let urlTitle = "XChain"
    if(props.xcpData.asset == "BTC"){
        url = "https://mempool.space/tx/"+props.txid
        urlTitle = "Mempool"
    }

    return (
        <div className="w-full px-5 pt-4 pb-8 rounded-lg my-2">
            <div className="text-center mt-8 pb-8">
                <div className="mb-6 text-2xl font-bold">Transaction sent!</div>
                <div className="text-sky-500"><a href={url} target="_blank" rel="noreferrer">View on {urlTitle}</a></div>
            </div>
            {props.children}
        </div>
    )

}

