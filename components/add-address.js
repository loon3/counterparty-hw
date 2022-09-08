import { useRouter } from 'next/router'
import { useState, useEffect } from "react";
import { getAddressFromPathLedger } from '../lib/ledger.js'

export default function AddAddressSelect(props) {
    const router = useRouter()
    
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)

    function handleClick(){
        setStatus("clicked")
    }
    
    function handleAdd(format){
        
        setLoading("Getting address from device...")

        const addressList = JSON.parse(window.localStorage.getItem("addressList"))
        const addressListByFormat = addressList.filter(function(item){if (item.format === format) {return true} else {return false}})
        
        const nextIndex = addressListByFormat.length
        
        console.log(format)
        
        getAddressFromPathLedger(format, nextIndex, function(response){
            if(response.status == "success"){
                addressList.push(response.message)
                window.localStorage.setItem("addressList", JSON.stringify(addressList))
                window.location.reload()
            } else {
                setError(response.message)
            }
        })
    }
    
    if (status == "clicked" && loading && !error) return (
        <div className="ml-3 py-4">
            <div className="inline-block text-sm font-medium">{loading}</div>            
        </div>
    )

    if (status == "clicked" && !loading && !error) return (
        <div className="py-4 text-center">
            <button className="inline-block justify-center mx-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" onClick={() => handleAdd("legacy")}>ADD LEGACY</button>
            <button className="inline-block justify-center mx-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-black hover:bg-white hover:border-black hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" onClick={() => handleAdd("bech32")}>ADD NATIVE SEGWIT</button>
        </div>
    )
    
    if (error) {
        
        alert(error)
        
        setStatus(null)
        setError(null)
        setLoading(null)
    }

    return (
        <div className="ml-3 py-4" onClick={() => handleClick()}>
            <div className="inline-block text-sm font-medium">Add New Address...</div>            
        </div>
    )
}