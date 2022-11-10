import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'
import Loading from '../components/loading'
import { getAddressFromStorage, getPassphraseFromStorage } from '../lib/fetch.js'
import { signMessageLedger } from '../lib/ledger.js'
import { getPrivkeyFromPassphrase, signMessagePassphrase, verifyMessageSignature } from '../lib/xcp.js'

//console.log(verifyMessageSignature("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiYmMxcXdhN2N4ZzVuYXN3c3dzM2o1dzY4ODJ6cGh3OWpoc25xbGg2ZGVrIiwiaWF0IjoxNjY3ODQ4ODA1LCJleHAiOjE2Njc4NDg4NjV9.wniR9YvLkaGFbUoSMGBN2vj4rYaTPuDrDMPJUC8cm6w", "bc1qwa7cxg5naswsws3j5w6882zphw9jhsnqlh6dek", "IFKtkNTzZ9RxwEFHcZGNJgvJwYJL70CFyCsd0FPh0r+8YMuAkjWYuLJIbPb8TWQn3iR3mmRupbTpuyApI5eihzc="))
//
//console.log(verifyMessageSignature("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiYmMxcTRzZjhsbHZ3cmZkd3F4cDdjcG1qOG56ZXhwY3FjYXI5bmc3ZWhhIiwiaWF0IjoxNjY3ODQ5Nzg2LCJleHAiOjE2Njc4NDk4NDZ9.RM0j4AEPZgl9qgNHUbdwCtorThQjynAU8iGntooB5Kg","bc1q4sf8llvwrfdwqxp7cpmj8nzexpcqcar9ng7eha","IGCkS77AYLjozPIguKLhZA4En4G1A8YK2tHce9AD3jqudwkqjSmbHVn26/iKtU97zKDR2beoCcGIoZiRmzbWFBM="))
//
//{"msg": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiYmMxcXdhN2N4ZzVuYXN3c3dzM2o1dzY4ODJ6cGh3OWpoc25xbGg2ZGVrIiwiaWF0IjoxNjY3ODQ4ODA1LCJleHAiOjE2Njc4NDg4NjV9.wniR9YvLkaGFbUoSMGBN2vj4rYaTPuDrDMPJUC8cm6w", "address": "bc1qwa7cxg5naswsws3j5w6882zphw9jhsnqlh6dek", "sig": "IFKtkNTzZ9RxwEFHcZGNJgvJwYJL70CFyCsd0FPh0r+8YMuAkjWYuLJIbPb8TWQn3iR3mmRupbTpuyApI5eihzc="}
//
//{"msg": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiYmMxcTRzZjhsbHZ3cmZkd3F4cDdjcG1qOG56ZXhwY3FjYXI5bmc3ZWhhIiwiaWF0IjoxNjY3ODQ5Nzg2LCJleHAiOjE2Njc4NDk4NDZ9.RM0j4AEPZgl9qgNHUbdwCtorThQjynAU8iGntooB5Kg", "address": "bc1q4sf8llvwrfdwqxp7cpmj8nzexpcqcar9ng7eha", "sig": "IGCkS77AYLjozPIguKLhZA4En4G1A8YK2tHce9AD3jqudwkqjSmbHVn26/iKtU97zKDR2beoCcGIoZiRmzbWFBM="}

export default function SignMessagePage() {
    
    const router = useRouter()
    
    let message = null
    if(router.query.msg){message = router.query.msg}
    
    const [thisAddress, setAddress] = useState({"address": null, "derivationPath": null, "format": null, "formatType": null, "index": null, "key": null})
    const [isLoading, setLoading] = useState(true)  

    useEffect(() => {
        const address = getAddressFromStorage("array")   
        if(!address){
            router.push('/settings/select')
        } else {
            setAddress(address)
            setLoading(false)
        }
    }, [])

    if (isLoading) return (
        <PageTemplate>
            <Loading />
        </PageTemplate>
    )
    
    return (
        <PageTemplate address={thisAddress}>
            <MessageSignForm address={thisAddress} message={message}/>
        </PageTemplate>
    )
}


export function MessageSignForm(props) {
        
    const [isSigned, setSigned] = useState("init")
    const [status, setStatus] = useState("Preparing to Sign...")
    const [messageData, setMessageData] = useState(null)
    const [signature, setSignature] = useState(null)
    
    function handleSignAnother(){
        setSigned("init")
    }
    
    
    const handleSubmit = (event) => {
        
        window.scrollTo(0, 0)
    
        event.preventDefault()
        
        if(props.address.key == "ledger") {
                
            setSigned("signing")    
            setStatus("Sending message to device for signing...")

            const data = {
                address: props.address.address,
                format: props.address.format,
                derivationPath: props.address.derivationPath,
                message: event.target.message.value,
            }

            setMessageData(data)

            event.target.reset()

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
        
        if(props.address.key == "passphrase") {
            
            const passphrase = getPassphraseFromStorage()
            const privkey = getPrivkeyFromPassphrase(passphrase, props.address)
            const sig = signMessagePassphrase(event.target.message.value, props.address, privkey)
            
            setMessageData({message: event.target.message.value})
            setSignature(sig)
            setSigned("signed")    
            
            event.target.reset()
        
        }

    }    
      
    if (isSigned == "signing") return (
        <div className="mb-10">{status}</div>
    ) 
    
    if (isSigned == "signed") return (
        <div className="w-full max-w-2xl">
            <div className="px-5 pt-4 pb-8 rounded-lg">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-10">
                        <div className="text-lg underline text-gray-500">Message:</div>
                        <div className="font-bold break-words">{messageData.message}</div>
                    </div>
                    <div className="mb-2">
                        <div className="text-lg underline text-gray-500">Signature:</div>
                        <div className="font-bold break-words">{signature}</div>
                    </div>
                    <div className="mt-12 w-full">
                        <div className="flex flex-col max-w-xs text-center m-auto">
                            <button className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" onClick={() => handleSignAnother()}>
                                Sign Another Message
                            </button>
                        </div>  

                    </div>        
                </div>  
            </div>  
        </div>
    )
  
    return (
  
        <div className="w-full max-w-2xl">    
            <h1 className="text-3xl font-bold mb-8 text-center">
                Sign Message
            </h1>
            <div id="sendForm">  
                <div className="w-full px-5 pt-4 pb-8 rounded-lg">

                    <form onSubmit={handleSubmit} autoComplete="off" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div>
                            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                            <div className="flex">
                                <input type="message" name="message" id="message" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" defaultValue={props.message ? props.message:""} required />
                            </div>
                        </div>
                        {props.address.key == "ledger" && 
                        <div className="mt-14 text-center">
                            <div className="max-w-80 justify-center inline-flex">Unlock your Ledger device and open the Bitcoin app before clicking sign</div>
                        </div>  
                        }

                        <div className="mt-12 w-full">
                            <div className="flex flex-col max-w-xs text-center m-auto">
                                <button className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                                    Sign
                                </button>
                            </div>  

                        </div>
                    </form>  
                </div>  
            </div>
        </div>
          
    )


}
