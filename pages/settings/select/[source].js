import styles from '../../../styles/Home.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import PageTemplate from '../../../components/template'
import Loading from '../../../components/loading'
import { getAddressSelectLedger, getAddressFromPathLedger } from '../../../lib/ledger.js'
import { getAddressFromStorage, getPassphraseFromStorage, getTryConnect, setTryConnect } from '../../../lib/fetch.js'
import { aesDecrypt, getAddressFromPassphrase } from '../../../lib/xcp.js'




export async function getStaticPaths() {
  const paths = [
    { params: { source: 'passphrase' }},
    { params: { source: 'ledger' }}
  ]
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
    
  const source = params.source    
    
  return {
    props: {
      source
    }
  }
}


export function AddAddressSelect(props) {
    
    const passphraseString = getPassphraseFromStorage()
    
    const router = useRouter()
    
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)

    function handleClick(){
        setStatus("clicked")
    }
    
    function handleAdd(format){
        
        if(props.source == "ledger"){
            
            setLoading("Getting address from device...")

            const addressList = JSON.parse(window.localStorage.getItem("addressListLedger"))
            const addressListByFormat = addressList.filter(function(item){if (item.format === format) {return true} else {return false}})

            const nextIndex = addressListByFormat.length

            console.log(format)

            getAddressFromPathLedger(format, nextIndex, function(response){
                if(response.status == "success"){
                    addressList.push(response.message)
                    window.localStorage.setItem("addressListLedger", JSON.stringify(addressList))
                    props.setAdded(true)
                    setLoading(null)
                } else {
                    setError(response.message)
                }
            })
            
        }
        
        if(props.source == "passphrase"){
            
            setLoading("Getting address from passphrase...")
            
            const addressList = JSON.parse(window.localStorage.getItem("addressListPassphrase"))
            const addressListByFormat = addressList.filter(function(item){if (item.format === format) {return true} else {return false}})

            const nextIndex = addressListByFormat.length
            const derivationPath = "m/0'/0/"+nextIndex
            let formatType = null
            
            if(format == "legacy"){formatType = "LEGACY"}
            if(format == "bech32"){formatType = "NATIVE SEGWIT"}
                            
            const newAddress = getAddressFromPassphrase(passphraseString, {address: null, derivationPath: derivationPath, format: format, formatType: formatType, index: nextIndex})
            
            addressList.push(newAddress.message)
            window.localStorage.setItem("addressListPassphrase", JSON.stringify(addressList))
            props.setAdded(true)
            setLoading(null)
        }
    }
    
    if (error) {
        
        alert(error)
        
        setStatus(null)
        setError(null)
        setLoading(null)
    }
    
    if (loading) return (
        <div className="ml-3 py-2">
            <div className="inline-block text-sm font-medium my-4">{loading}</div>            
        </div>
    )

    if (status == "clicked") return (
        <div className="py-2 text-center">
            <button className="inline-block justify-center m-2 px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" onClick={() => handleAdd("legacy")}>ADD LEGACY</button>
            <button className="inline-block justify-center m-2 px-4 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" onClick={() => handleAdd("bech32")}>ADD NATIVE SEGWIT</button>
        </div>
    )
    


    return (
        <div className="ml-3 py-2" onClick={() => handleClick()}>
            <div className="inline-block text-sm font-medium my-4">Add New Address...</div>            
        </div>
    )
}

export default function SelectAddressPage(props) {

    const router = useRouter()
    
    const source = props.source
    
    const [thisAddress, setAddress] = useState(null) 
    const [addressList, setAddressList] = useState(null)     
    const [loading, setLoading] = useState(null)  
    const [isError, setError] = useState(null)  
    
    const [needPassword, setNeedPassword] = useState(false)
    
    const [addressAdded, setAddressAdded] = useState(false)
    
        
    
    function handleAddressSelect(address){
        
        window.sessionStorage.setItem("address", JSON.stringify(address))
        const tryConnect = getTryConnect()
        
        if(tryConnect){
            setTryConnect(false)
            router.push('/connect')
        } else {
            router.push('/wallet')
        }
            
    }
    
    const handlePasswordSubmit = (event) => {
 
        event.preventDefault()
        
        const passwordEntered = event.target.password.value
        const passphraseEncrypted = window.localStorage.getItem("passphrase")
        
        const passphraseDecrypted = aesDecrypt(passphraseEncrypted, passwordEntered)
        
        
        
        if(passphraseDecrypted) {
            const checkValid = getAddressFromPassphrase(passphraseDecrypted)
            
            if(checkValid.status == "success"){
                window.sessionStorage.setItem("passphrase", passphraseDecrypted)
                setNeedPassword(false)
            } else {
                setError("Incorrect Password")
            }
                     
        } else {
            setError("Incorrect Password")
        }
        
        
    }
    
    function handleTryAgain(){
        setError(null) 
    }

    useEffect(() => {

        const address = getAddressFromStorage("all")    
        setAddress(address)
        
        if(source == "ledger"){
            
            setLoading("Connecting to device...")
        
            const addressListStorage = window.localStorage.getItem("addressListLedger")

            if(!addressListStorage){

                getAddressSelectLedger(function(deviceResponse){            
                    if(deviceResponse.status == "success"){
                        window.localStorage.setItem("addressListLedger", JSON.stringify(deviceResponse.message))
                        setAddressList(deviceResponse.message)
                    } else {
                        setLoading(deviceResponse.message)                
                    } 
                })

            } else {
                setAddressList(JSON.parse(addressListStorage))         
            }
            
        }
        
        if(source == "passphrase") {
            
            const addressListStorage = window.localStorage.getItem("addressListPassphrase")
            const passphrase = window.sessionStorage.getItem("passphrase")

            if(!addressListStorage){
                router.push('/settings/passphrase')   
            } else {
                setAddressList(JSON.parse(addressListStorage))
                
                if(!passphrase){
                    setNeedPassword(true)
                }     
                
            }
                        
        }
             
    }, [])
    
    useEffect(() => {
        
        if(source == "passphrase") {
            const addressListStorage = window.localStorage.getItem("addressListPassphrase")
            setAddressList(JSON.parse(addressListStorage))
        }
        if(source == "ledger"){
            const addressListStorage = window.localStorage.getItem("addressListLedger")
            setAddressList(JSON.parse(addressListStorage))
        }
        setAddressAdded(false)

    }, [addressAdded])

    
    if (isError) return (
        <PageTemplate address={thisAddress}>
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold mb-8 text-center">{isError}</h1>
                <div className="mt-10">
                    <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="button" onClick={() => handleTryAgain()}>
                        Try Again...
                    </button>
                </div>
            </div>
        </PageTemplate>
    )

    if (needPassword) return (

            <PageTemplate address={thisAddress}>
            <div className="w-full max-w-lg text-center">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Open Wallet
                </h1>
                <div id="sendForm">  
                    <div className="w-full max-w-2xl pt-2 pb-8 rounded-lg">

                        <form onSubmit={handlePasswordSubmit} autoComplete="off" className="bg-white shadow-md rounded px-6 pt-6 pb-8 mb-4">
                            <div>
                                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Enter Your Password</label>
                                <div className="flex">
                                    <input type="password" name="password" id="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" defaultValue="" required />
                                </div>
                            </div>


                            <div className="mt-12 w-full">
                                <div className="flex flex-col max-w-xs text-center m-auto">
                                    <button className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                                        Unlock
                                    </button>
                                </div>  
                                        
                                <div className="flex flex-col max-w-xs text-center mx-auto mt-6">
                                    <button className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => router.push('/settings/forget')}>
                                        Forget Passphrase
                                    </button>
                                </div>
                            </div>
                        </form>  
                    </div>  
                </div>
            </div>
            </PageTemplate>
           
    )

   
    if (addressList) return (
    <PageTemplate address={thisAddress}>
        <div className="my-16">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Select Address
        </h1>
        <div className="w-full max-w-2xl">
            <ul role="list" className="p-2 divide-y divide-slate-200">
            {addressList.map((address) => (
                <li 
                    className={styles.addressListSelect} 
                    key={address.address}
                    onClick={() => handleAddressSelect(address)}
                >
                    <div className="ml-3 break-all py-4 overflow-hidden">
                        <div className="inline-block text-sm font-medium py-2">{address.address}</div>
                        <div className="inline-block text-xs p-1 mx-2 mt-1.5 text-white bg-slate-400 rounded float-right">{address.formatType} &#35;{address.index+1}</div>
                    </div>
                </li>
            ))}
                <li className={styles.addressListSelect}>
                    <AddAddressSelect source={source} setAdded={(add) => setAddressAdded(add)}/>
                </li>
            </ul>
        </div>
        </div>
    </PageTemplate>
    )
    
    return (
        
        <PageTemplate address={thisAddress}>

            <Loading />

            <div className="text-center mt-8">{loading}</div>
        </PageTemplate>
    )

}
