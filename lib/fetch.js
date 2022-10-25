//import { getMostFrequent } from './util.js'

export function getRecommendedFeeRate(callback) {
    
    if(process.env.testMode){return {"fastestFee":1,"halfHourFee":1,"hourFee":1,"economyFee":1,"minimumFee":1}}
    
    let url = "https://mempool.space/api/v1/fees/recommended"
    fetch(url).then(response => response.json()).then(data => callback(data))
}

export function getUtxosFromAddress(address, callback) {
    var url = "https://api.blockcypher.com/v1/btc/main/addrs/"+address+"?unspentOnly=1&includeScript=1"+"&token="+process.env.blockcypherToken
    fetch(url).then(response => response.json()).then(data => callback(data))
}

export function getHexFromUtxo(utxoArray, callback) {
       
    var urls = []
    for(const utxo of utxoArray){
        urls.push("https://api.blockcypher.com/v1/btc/main/txs/"+utxo.txid+"?includeHex=1"+"&token="+process.env.blockcypherToken)
    }
    
    Promise.all(urls.map(url => fetch(url).then(response => response.json()))).then(function(data){      
        var hexWithVout = []
        for (var i = 0; i < data.length; i++) {
            hexWithVout[i] = [data[i].hex, utxoArray[i].vout]
        }
        callback(hexWithVout)
    }) 
                  
}

export function getHexFromUtxoPassphrase(utxoArray, callback) {
       
    var urls = []
    for(const utxo of utxoArray){
        urls.push("https://api.blockcypher.com/v1/btc/main/txs/"+utxo.txid+"?includeHex=1"+"&token="+process.env.blockcypherToken)
    }
    
    Promise.all(urls.map(url => fetch(url).then(response => response.json()))).then(function(data){      
        var hexWithVout = []
        for (var i = 0; i < data.length; i++) {
            hexWithVout[i] = {
                    hash: utxoArray[i].txid,
                    index: utxoArray[i].vout,
                    hex: data[i].hex,
                    script: utxoArray[i].scriptPubKey,
                    value: utxoArray[i].amount,
                    witness: (data[i].outputs[utxoArray[i].vout].script_type).split("-").includes("witness")
                 }
        }
        callback(hexWithVout)
    }) 
                  
}

export function recommendedFee(callback){
      
    const defaultTxBytes = process.env.defaultTxBytes 
    
    getRecommendedFeeRate(function(data){
        let fee_recommended = 0
        if(data.fastestFee) {fee_recommended = (data.fastestFee * defaultTxBytes) / 100000000} 
        callback(fee_recommended)
    })

}

export function getBtcFromAddress(address, callback) {
    
    const testData = {
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
    if(process.env.testMode){return testData}
    
    const url = "https://api.blockcypher.com/v1/btc/main/addrs/"+address+"/balance"+"?token="+process.env.blockcypherToken
    fetch(url).then(response => response.json()).then(data => callback(data))
}

function getUnconfirmedAssetsFromAddress(address, callback) {
    const url = "https://www.xchain.io/api/mempool/"+address
    
    let unconfirmedBalances = {}
    
    try {
    
        fetch(url).then(response => response.json()).then(function(data){        
            for(const tx of data.data){
                if(tx.tx_type == "Send"){           
                    if(tx.destination != address){tx.quantity = -tx.quantity}
                    if(unconfirmedBalances[tx.asset]){
                        unconfirmedBalances[tx.asset] += tx.quantity
                    } else {
                        unconfirmedBalances[tx.asset] = tx.quantity
                    }
                }
            }

            callback(unconfirmedBalances)
        })
    
    } catch (e) { callback(unconfirmedBalances) }
}

export function getAssetsFromAddress(address, callback) {
    
    getUnconfirmedAssetsFromAddress(address, function(unconfirmed){
    
        getAssetBalances(address, function(data){
            
            const directories = [
                                    "Rare Pepes", 
                                    "Fake Rares",
                                    "Fake Commons",
                                    "Dank Rares",
                                    "Other"
                                ]
            
            data.directories = directories
            
            getWtf(function(pepes){
                
                console.log(pepes)
                
                for (var i = 0; i < data.data.length; i++) {
                    data.data[i].index = i
                    
                    data.data[i].wtf = pepes[data.data[i].asset]
                    
                    if(pepes[data.data[i].asset]){
                        data.data[i].directory = (pepes[data.data[i].asset].collectionName).replace(/\s+/g, '-').toLowerCase()
                    } else {
                        data.data[i].directory = "other"
                    }
                                
                    if(data.data[i].quantity.indexOf(".") == -1){
                        data.data[i].divisible = false
                    } else {
                        data.data[i].divisible = true
                    } 

                    if(unconfirmed[data.data[i].asset]){
                        data.data[i].unconfirmed = unconfirmed[data.data[i].asset]
                    } else {
                        data.data[i].unconfirmed = 0
                    }
                }
                
                       
                callback(data)
            })
            
        })
    
    })

    

function getAssetBalances(address, callback){
    
    const urlInit = "https://xchain.io/api/balances/"+address
        
    fetch(urlInit).then(response => response.json()).then(function(data){
        if(data.total <= 500){
            callback(data)
        } else {
            let assetCount = data.total
            let pages = Math.ceil(data.total / 500)
            let urls = []
            
            for(var i=2; i <= pages; i++){
                urls[i-2] = "https://xchain.io/api/balances/"+address+"/"+i
            }

            var allData = data.data
            
            Promise.all(urls.map(url => fetch(url).then(response => response.json()))).then(function(data){  

                for(var j=0; j < data.length; j++){
                    for(var k=0; k < data[j].data.length; k++){
                        allData.push(data[j].data[k])
                    }
                }
                
                var dataFinal = {address: address, data: allData, total: assetCount};
                
                callback(dataFinal)
                
            })
        } 
    })
}    



} 

function getWtf(callback){
    const url = "https://pepewtf.s3.amazonaws.com/wallet/assets.json"
    //const url = "/wtf.json"
    fetch(url).then(response => response.json()).then(function(data){
        
        //console.log(data)
        
        let assetsAsKeys = []
        for(const asset of data){
            assetsAsKeys[asset.name] = asset
        }
        callback(assetsAsKeys)
    })    
}

export function getAssetInfo(asset, callback){
    const url = "https://xchain.io/api/asset/"+asset
    fetch(url).then(response => response.json()).then(function(data){
        callback(data)
    })
}

export function getAddressFromStorage(param){
        
    let addressInfoJson = window.sessionStorage.getItem("address")
    
    let response = null
    
    if(addressInfoJson){
        let addressInfo = JSON.parse(addressInfoJson)
        response = addressInfo.address
        if(param == "derivationPath") { response = addressInfo.derivationPath}
        if(param == "format") { response = addressInfo.format }
        if(param == "key") { response = addressInfo.key }
        if(param == "all" || param == "array") { response = addressInfo }
    }
    
    return response
    
}

export function getPassphraseFromStorage(){

    const pass = window.sessionStorage.getItem("passphrase")
    
    return pass
    
}

export function checkConnected(){
            
    let connectedLedger = window.localStorage.getItem("addressListLedger")
    let connectedPassphrase = window.localStorage.getItem("addressListPassphrase")
    
    let connectedBoth = null
    if(connectedLedger && connectedPassphrase){connectedBoth = true}
    
    let connectedAny = null
    if(connectedLedger || connectedPassphrase){
        if(connectedLedger){ connectedAny = "ledger" }
        if(connectedPassphrase){ connectedAny ="passphrase" }
    }
    
    
    return {ledger: connectedLedger, passphrase: connectedPassphrase, both: connectedBoth, any: connectedAny}
    
}

export function pushTx(signedTxHex, callback){
        
    const req = {tx: signedTxHex}
    
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
    };
    
    fetch('https://api.blockcypher.com/v1/btc/main/txs/push', requestOptions).then(response => response.json()).then(function(data){ 
        console.log(data)
        callback(data.tx.hash)
    })
   
}


// FOR TESTING

export function getUtxosFromAddressTest(address, callback) {
    var url = "/testUtxo.json"
    fetch(url).then(response => response.json()).then(data => callback(data))
}

export function getHexFromUtxoTest(utxoArray, callback) {
       
    var url = "/testUtxoHex.json"
    
    fetch(url).then(response => response.json()).then(function(data){   
        
        let dataInArray = [data]
        let hexWithVout = []

        for (var i = 0; i < dataInArray.length; i++) {    
                
            hexWithVout[i] = {
                                hash: utxoArray[i].txid,
                                index: utxoArray[i].vout,
                                hex: dataInArray[i].hex,
                                script: utxoArray[i].scriptPubKey,
                                value: utxoArray[i].amount,
                                witness: (dataInArray[i].outputs[utxoArray[i].vout].script_type).split("-").includes("witness")
                             }
        }
        
        callback(hexWithVout)
    }) 
                  
}
