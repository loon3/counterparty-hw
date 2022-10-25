import styles from '../../styles/Home.module.css'
import Link from 'next/link'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import PageTemplate from '../../components/template'
import { getAddressFromStorage, checkConnected } from '../../lib/fetch.js'
import { getNewPassphrase, getAddressFromPassphrase, aesEncrypt } from '../../lib/xcp.js'


export default function PassphrasePage() {
    
    const router = useRouter()

    const [thisAddress, setAddress] = useState(null)  
    const [isLoading, setLoading] = useState(true)  
    
    useEffect(() => {
        setLoading(true)
        const address = getAddressFromStorage("all") 
        setAddress(address)
        
        const connected = checkConnected()
        if(connected.both || connected.any == "passphrase"){
            router.push('/settings/select/passphrase')
        } else {
            setLoading(false)
        }        
        
    }, [])   
    
    if (isLoading) return (
        <PageTemplate>
            <div className="text-center">Loading...</div>
        </PageTemplate>
    )
    
    return (
    <PageTemplate address={thisAddress}>

        <PassphraseMethod />

    </PageTemplate>
    )
}


export function PassphraseMethod(props){
    
    const [methodSelect, setMethodSelect] = useState(null)  
    
    
    function handleImport(){
        setMethodSelect("import")
    }
    
    function handleGenerate(){
        setMethodSelect("generate")
    }
    
    if(methodSelect == "generate") return (
        <ImportPassphrase method="generate" />
    )
        
    if(methodSelect == "import") return (
        <ImportPassphrase method="import" />
    )
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-center">
                Select Passphrase
            </h1>
            <div className={styles.grid}>

                
                    <button type="button" className={styles.card} onClick={() => handleGenerate()}>
                        <h3>Generate New &rarr;</h3>
                    </button>
           
               
                    <button type="button" className={styles.card} onClick={() => handleImport()}>
                        <h3>Import Existing &rarr;</h3>
                    </button>
          

            </div>
        </div>
    )
}

export function ImportPassphrase(props){
            
    const [passphraseShown, setPassphraseShown] = useState(false)
    const [error, setError] = useState(null)
    const [thisPassphrase, setPassphrase] = useState(null)
    const [thisAddressList, setAddressList] = useState(null)
    const [newPassphrase, showNewPassphrase] = useState(false)
    const [isLoading, setLoading] = useState(true)  
    
    function togglePassphraseShown(){
        setPassphraseShown(!passphraseShown)
    }
    
    function handleTryAgain(){
        setError(null)
    }
    
    function handleCreatePassphrase(){
        showNewPassphrase(true)
        setPassphrase(getNewPassphrase())
    }
    
    function handleContinueAfterCreate(passphrase){
        const addressArray = getAddressFromPassphrase(passphrase)
        setAddressList(addressArray.message)
        showNewPassphrase(false)
    }
    
    const handleImport = (event) => {
 
        event.preventDefault()
        
        const addressArray = getAddressFromPassphrase(event.target.passphrase.value)
        
        if(addressArray.status == "success"){
            setAddressList(addressArray.message)
            setPassphrase(event.target.passphrase.value)
        } else {
            console.log(addressArray.message)
            setError(addressArray.message)      
        } 
        
        event.target.reset()
        
    }
     
    useEffect(() => {
       
        if(props.method == "generate") {
            showNewPassphrase(true)
            setPassphrase(getNewPassphrase())
        }
        
        setLoading(false)       
        
    }, [])  
    
    if (isLoading) return (   
        <div className="text-center">Loading...</div>     
    )

    if (error) return (
        <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-8 text-center">Invalid passphrase!</h1>
            <div className="mt-10">
                <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="button" onClick={() => handleTryAgain()}>
                    Try Again...
                </button>
            </div>
        </div>
    )
    
    if(newPassphrase) return (
        <div className="w-full max-w-2xl py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Your New Wallet was Created&#33;
            </h1>
            <div className="bg-white shadow-md rounded px-1 pt-6 pb-8 mb-4">
                <div className="mb-12 mx-4 p-2 bg-black text-white font-mono text-center">
                    {thisPassphrase}
                </div>
                <div className="mb-8 mx-4">
                    <p className="text-justify w-full">Your 12&#8208;word passphrase to access your wallet is shown in the black box above. Write it down and keep it safe. If you lose this passphrase, you will lose access to your wallet forever. If someone gets your passphrase, they gain access to your wallet. We do not store your passphrase and cannot recover it if lost.</p>
                </div>

                <div className="flex flex-col max-w-xs text-center m-auto">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded focus:outline-none focus:shadow-outline uppercase text-sm m-2" type="button" onClick={() => handleContinueAfterCreate(thisPassphrase)}>
                        I&#39;ve Written Down My 12&#8208;words
                    </button>
                </div>
            </div>
            <p className="text-center text-gray-500 text-xs">
                Compatible with Freewallet, Counterwallet, Rarepepewallet.com and Fakerarewallet.com
            </p>
        </div>
    )
    
    if(thisPassphrase) return (
        <div>
            <EncryptPassphrase addressList={thisAddressList} passphrase={thisPassphrase}/>
        </div>
    )
    
    return (
        <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Import Wallet
            </h1>
            <form onSubmit={handleImport} autoComplete="off" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-10">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passphrase">
                        Your 12&#8208;word Passphrase
                    </label>
                    <div className="flex">
                        <input name="passphrase" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2" id="passphrase" type={passphraseShown ? "text" : "password"} placeholder="correct horse battery staple knock hopefully stole rope season please become admit" required />
                        <button onClick={() => togglePassphraseShown()} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-0.5 px-1 rounded focus:outline-none focus:shadow-outline ml-2 my-[1px] w-[72px] uppercase text-sm" type="button">
                            {passphraseShown ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>


                <div className="flex flex-col max-w-xs text-center m-auto">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="submit">
                        Import
                    </button>
                </div>
            </form>
            <p className="text-center text-gray-500 text-xs">
                Compatible with Freewallet, Counterwallet, Rarepepewallet.com and Fakerarewallet.com
            </p>
        </div>
    )
    
}


export function EncryptPassphrase(props){
    
    const router = useRouter()            
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null)
    

    function handleTryAgain(){
        setError(null)
    }
    
    const handleEncrypt = (event) => {
  
        event.preventDefault()
              
        if(event.target.password.value == event.target.passwordagain.value){     
            
            let encryptedPassphrase = aesEncrypt(props.passphrase, event.target.password.value)
            window.localStorage.setItem("passphrase", encryptedPassphrase)
            window.localStorage.setItem("addressListPassphrase", JSON.stringify(props.addressList))
            window.sessionStorage.setItem("passphrase", props.passphrase)
            
            router.push('/settings/select/passphrase')  
        } else {
            setError("Passwords do not match!")
            event.target.reset()
        }
        
    }

    if (error) return (
        <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-8 text-center">{error}</h1>
            <div className="mt-10">
                <button className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="button" onClick={() => handleTryAgain()}>
                    Try Again...
                </button>
            </div>
        </div>
    )
    
    return (
        <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Choose a Password to Lock your Wallet
            </h1>
            <form onSubmit={handleEncrypt} autoComplete="off" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 text-center">
                <div className="mb-10">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Your Password
                    </label>
                    <div className="flex">
                        <input name="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" id="password" type="password" placeholder="" required/>
                    </div>
                </div>
                <div className="mb-10">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passwordagain">
                        Your Password Again
                    </label>
                    <div className="flex">
                        <input name="passwordagain" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" id="passwordagain" type="password" placeholder="" required/>
                    </div>
                </div>

                <div className="flex flex-col max-w-xs text-center m-auto">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline m-2 uppercase text-sm" type="submit">
                        Lock
                    </button>
                </div>
            </form>
        </div>           
    )
    
    
}