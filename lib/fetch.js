export function getRecommendedFeeRate(callback) {
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

export function recommendedFee(callback){
        
    const defaultTxBytes = process.env.defaultTxBytes 
    
    getRecommendedFeeRate(function(data){
        let fee_recommended = 0
        if(data.fastestFee) {fee_recommended = (data.fastestFee * defaultTxBytes) / 100000000} 
        callback(fee_recommended)
    })

}

export function getBtcFromAddress(address, callback) {
    const url = "https://api.blockcypher.com/v1/btc/main/addrs/"+address+"/balance"+"?token="+process.env.blockcypherToken
    fetch(url).then(response => response.json()).then(data => callback(data))
}

function getUnconfirmedAssetsFromAddress(address, callback) {
    const url = "https://www.xchain.io/api/mempool/"+address
    fetch(url).then(response => response.json()).then(function(data){        
        let unconfirmedBalances = {}
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
}

export function getAssetsFromAddress(address, callback) {
    
    getUnconfirmedAssetsFromAddress(address, function(unconfirmed){
    
        const url = "https://xchain.io/api/balances/"+address
        fetch(url).then(response => response.json()).then(function(data){
            for (var i = 0; i < data.total; i++) {
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
