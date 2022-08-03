export function getRecommendedFeeRate(callback) {
    var url = "https://api.blockcypher.com/v1/btc/main"+"?token="+process.env.blockcypherToken
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

export function getAssetsFromAddress(address, callback) {
    
    var url = "https://xchain.io/api/balances/"+address
    fetch(url).then(response => response.json()).then(function(data){
        for (var i = 0; i < data.total; i++) {
            if(data.data[i].quantity.indexOf(".") == -1){
                data.data[i].divisible = false
            } else {
                data.data[i].divisible = true
            } 
        }
        callback(data)
    })

//TODO:  Addresses with over 500 assets...
    
//        if(dataInit.total <= 500){
//            callback(dataInit)
//        } else {
// 
//            var pages = Math.ceil(dataInit.total / 500)
//            var urls = []
//            
//            for(var i=2; i <= pages; i++){
//                urls[i-2] = "https://xchain.io/api/balances/"+address+"/"+i
//            }
//
//            var allData = dataInit.data
//            
//            Promise.all(urls.map(url => $.getJSON(url))).then(function(data){
//
//                for(var i=0; i < data.length; i++){
//                    for(var k=0; k < data[i].data.length; k++){
//                        allData.push(data[i].data[k])
//                    }
//                }
//                
//                var dataFinal = {address: address, data: allData, total: dataInit.total};
//                
//                callback(dataFinal)
//                
//            })
//        }

}

export function getBtcFromAddress(address, callback) {
    var url = "https://api.blockcypher.com/v1/btc/main/addrs/"+address+"/balance"+"?token="+process.env.blockcypherToken
    fetch(url).then(response => response.json()).then(data => callback(data))
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
