import styles from '../styles/Home.module.css'
import Link from 'next/link'
import PageTemplate from '../components/template'

import { useState, useEffect } from "react";
import { createTxSendAssetOpreturn } from "../lib/xcp.js"
import { getHexFromUtxo, pushTx } from "../lib/fetch.js"
import { sendAssetLedger } from '../lib/ledger.js'


export default function AssetSendForm(props) {
    
      
  const [isSent, setSent] = useState("init")
  const [status, setStatus] = useState("Preparing to Send...")
  const [btcData, setBtcData] = useState(null)
  const [xcpData, setXcpData] = useState(null)
  const [txid, setTxid] = useState(null)
 
  const handleSubmit = (event) => {
 
    event.preventDefault()
      
    setSent("sending") 
       
    const txFeeSatoshis = parseInt(parseFloat(event.target.txfee.value) * 100000000)
    
    console.log(txFeeSatoshis)
      
    const data = {
      fromAddress: window.sessionStorage.getItem("address"),
      asset: props.asset,
      balance: props.balance,    
      toAddress: event.target.address.value,
      amount: event.target.amount.value,
      divisible: false,
      txFeeSatoshis: txFeeSatoshis
    }
    
    setXcpData(data)
    
    createTxSendAssetOpreturn(data.fromAddress, data.toAddress, data.asset, data.amount, data.divisible, data.txFeeSatoshis, function(res){
        getHexFromUtxo(res.inputs, function(hexData){
            setStatus("Sending transaction to device for signing...")
            var btcDataWithHex = {address: data.fromAddress, tx: res.tx, inputs: res.inputs, inputsWithHex: hexData}
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
    })
        
      
  }
  
  if (isSent == "sending") return (
        <div className="mb-10">{status}</div>
  )
  
  if (isSent == "sent") return (
        <AssetSendFormSent xcpData={xcpData} btcData={btcData} txid={txid}/>
  )
  
  return (
  
    <div id="sendForm">  
      <div className="w-[32rem] bg-slate-100 px-5 py-8 rounded-lg my-8">
        <h1 className="text-3xl font-bold text-center">
            Send {props.asset}
        </h1>  
        <div className="mt-4">              
            <h3 className="text-xl text-center text-gray-500">Available Balance: {props.balance}</h3>
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
                <div className="text-xs text-gray-500 text-right">(Suggested fee shown above)</div>
            </div>
            <div className="mt-12 text-center">
                <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Send</button>
            </div>  
        </form>  
      </div>  
    </div>  


  )
}

export function AssetSendFormSent(props) {
    
    var xchain = "https://xchain.io/tx/"+props.txid
    
    return (
        <div>
            <div className="max-w-3xl mb-10 text-center text-xl">Transaction sent!</div>
            <div className="max-w-3xl mb-10 text-center text-sky-500"><a href={xchain} target="_blank">View on XChain</a></div>
        </div>
    )

}