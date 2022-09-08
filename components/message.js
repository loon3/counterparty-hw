import { useState, useEffect } from "react";
import { signMessageLedger } from '../lib/ledger.js'



export default function MessageSignForm(props) {
        
    const [isSigned, setSigned] = useState("init")
    const [status, setStatus] = useState("Preparing to Sign...")
    const [messageData, setMessageData] = useState(null)
    const [signature, setSignature] = useState(null)

    const handleSubmit = (event) => {
      
        event.preventDefault()

        setSigned("signing")    
        setStatus("Sending message to device for signing...")

        const data = {
            address: props.address,
            format: props.format,
            derivationPath: props.derivationPath,
            message: event.target.message.value,
        }

        setMessageData(data)

        signMessageLedger(data, function(response){
            if(response.status == "success"){
                setSignature(response.message)
                setSigned("signed")
            } else if(response.status == "error"){
                setStatus(response.message)
            } else {
                setStatus("Something went wrong.")
            }            
        })
 
    }    
      
    if (isSigned == "signing") return (
        <div className="mb-10">{status}</div>
    )
  
    if (isSigned == "signed") return (
        <div className="w-[32rem] bg-slate-100 p-8 rounded-lg my-8">
            <div className="mb-10">
                <div className="text-lg underline text-gray-500">Message:</div>
                <div className="font-bold">{messageData.message}</div>
            </div>
            <div className="mb-2">
                <div className="text-lg underline text-gray-500">Signature:</div>
                <div className="font-bold break-words">{signature}</div>
            </div>
        </div>
    )
  
  return (
  
    <div id="signForm">  
      <div className="w-[32rem] bg-slate-100 px-5 py-8 rounded-lg my-8">
        <h1 className="text-3xl font-bold text-center">
            Sign Message
        </h1>  
   
        <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mt-14">
                <label htmlFor="message" className="block">Message</label>
                <input type="text" name="message" id="message" className="pl-2 mt-1 w-full border-2 border-slate-400 rounded-md" defaultValue="" required />
            </div>
           
            <div className="mt-14 text-center">
                <div className="w-80 justify-center inline-flex">Unlock your Ledger device and open the Bitcoin app before clicking sign</div>
            </div>  
            <div className="mt-12 text-center">
                <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">Sign</button>
            </div>  
        </form>  
      </div>  
      <div className="text-center">{props.children}</div>
    </div>
    


  )
}
