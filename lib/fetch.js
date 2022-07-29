export function getRecommendedFeeRate(callback) {
    var url = "https://api.blockcypher.com/v1/btc/main"
    fetch(url).then(response => response.json()).then(data => callback(data))
}

export function getUtxosFromAddress(address, callback) {
    var url = "https://api.blockcypher.com/v1/btc/main/addrs/"+address+"?unspentOnly=1&includeScript=1"
    fetch(url).then(response => response.json()).then(data => callback(data))
}

export function getHexFromUtxo(utxoArray, callback) {
       
    var urls = []
    for(const utxo of utxoArray){
        urls.push("https://api.blockcypher.com/v1/btc/main/txs/"+utxo.txid+"?includeHex=1")
    }
    
    Promise.all(urls.map(url => fetch(url).then(response => response.json()))).then(function(data){      
        var hexWithVout = []
        for (var i = 0; i < data.length; i++) {
            hexWithVout[i] = [data[i].hex, utxoArray[i].vout]
        }
        callback(hexWithVout)
    }) 
                  
}
//
//const utxoArrayTest = [
//    {txid: "299d70306afaf218626aae4f03ad39b63b404b3334d34932c7f8f3ae2081a0ee", vout: "0"},
//    {txid: "753d359432ae695e38300a288de6b8a28bcf91f4058547a4b4b45141bb2621b6", vout: "1"}
//]
//
//getHexFromUtxo(utxoArrayTest, function(data){
//    console.log(data)
//})

export function getAssetsFromAddress(address, callback) {
    var url = "https://xchain.io/api/balances/"+address
    fetch(url).then(response => response.json()).then(data => callback(data))

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
