import { BigInteger } from 'biginteger'
import { getUtxosFromAddress, getRecommendedFeeRate } from './fetch.js'
import { encodeMessageRC4 } from './util.js'

var Decimal = require('decimal.js-light')
var bitcoinjs = require('bitcoinjs-lib')

function padprefix(str, max) {      
    str = str.toString();
    return str.length < max ? padprefix('0' + str, max) : str;   
}

function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function getutxos(add_from, amountremainingSats, callback){
   
    var total_utxo = new Array();  
    var satoshi_change = 0;   
    //var amountremainingSats = parseInt(amountremaining * 100000000);
     
    getUtxosFromAddress( add_from, function( data ) {

        if(!data.txrefs){
            if(data.unconfirmed_txrefs){
                data = data.unconfirmed_txrefs
            } else {
                callback(total_utxo, satoshi_change);
            }
        } else {
            data = data.txrefs
        }

        if(!data){
            callback(total_utxo, satoshi_change);
        }
        
        data.sort(function(a, b) {
            return b.value - a.value
        });

        data.every(item => {
            
             var txid = item.tx_hash
             var vout = item.tx_output_n
             var script = item.script
             var amount = item.value
             
             amountremainingSats -= parseInt(amount);            
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
             
             total_utxo.push(obj);
             
             //REMOVED 
             //dust limit = 5460          
             //if (amountremaining == 0 || amountremaining < -0.00005460) {    
              
             if (amountremainingSats <= 0) { 
                 return false
             } else {
                 return true
             }
               
        });
        
        if (amountremainingSats < 0) {
            satoshi_change = -amountremainingSats
        }
        
        callback(total_utxo, satoshi_change);
        
    })
    
}

function assetid(asset_name) {
    
    //asset_name.toUpperCase();
    if (asset_name == "XCP") {        
        var asset_id = (1).toString(16);       
    } else if (asset_name == "BTC") {        
        var asset_id = (0).toString(16);   
    } else if (asset_name.substr(0, 1) == "A") {        
        var pre_id = asset_name.substr(1);       
        var pre_id_bigint = BigInteger(pre_id);      
        var asset_id = pre_id_bigint.toString(16);        
    } else {  
        var b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        var name_array = asset_name.split("");
        var n_bigint = BigInteger(0);
        
        for (var i = 0; i < name_array.length; i++) {      
            n_bigint = BigInteger(n_bigint).multiply(26);
            n_bigint = BigInteger(n_bigint).add(b26_digits.indexOf(name_array[i]));            
        }    

        var asset_id = n_bigint.toString(16);
    } 
    
    return asset_id;
    
}

function createSendMessageOpreturn(address, assetName, amount, divisible, callback) {
    
    var prefix = "434e54525052545902"; //CNTRPRTY + 02 (single byte message id)
    var asset_id = assetid(assetName); 
    
    console.log(assetName)
    console.log("from cxsdo: "+asset_id);
    
    let address_hex = "00" //assume p2pkh
    
    try{
        if(bitcoinjs.address.fromBase58Check(address).version == 5){address_hex = "05"} //check p2sh
    } catch {
        if(bitcoinjs.address.fromBech32(address).version == 0){address_hex = "80"} //check bech32
    }

    if(address_hex == "80"){
        address_hex += toHexString(bitcoinjs.address.fromBech32(address).data)
    } else {
        address_hex += toHexString(bitcoinjs.address.fromBase58Check(address).hash)
    }
    
    console.log(address_hex)
      
    var asset_id_hex = padprefix(asset_id.toString(16), 16);
    
    if(divisible){
        var amount_round = new Decimal(amount).toDecimalPlaces(8).times(1e8).toNumber();
    } else {
        var amount_round = parseInt(amount)
    }
    
    var amount_hex = padprefix((amount_round).toString(16), 16);
    
    var data = prefix + asset_id_hex + amount_hex + address_hex
    
    callback(data)
    
}

export function createTxSendAssetOpreturn(sendData, callback){
            
    getutxos(sendData.fromAddress, sendData.txFeeSatoshis, function(total_utxo, satoshi_change){ 

        createSendMessageOpreturn(sendData.toAddress, sendData.asset, sendData.amount, sendData.divisible, function(datachunk_unencoded){
        
            if(total_utxo.length == 0){callback("error")}            

            var datachunk_encoded = encodeMessageRC4(total_utxo[0].txid, datachunk_unencoded);
            
            console.log(datachunk_encoded)
            
            var scriptstring = "OP_RETURN "+datachunk_encoded;
            
            var tx = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.bitcoin);   
            
            //inputs
            for (var i = 0; i < total_utxo.length; i++) {  
                tx.addInput(total_utxo[i].txid, total_utxo[i].vout) 
            }
            console.log(total_utxo);

            //outputs            
            var ret = bitcoinjs.script.fromASM(scriptstring)
            tx.addOutput(ret, 0)
  
            console.log(satoshi_change);
            if (satoshi_change > 5459) {
                tx.addOutput(sendData.fromAddress, satoshi_change)

            }

            var finalTx = tx.buildIncomplete().toHex();

            console.log(finalTx)
            
            callback({tx: finalTx, inputs: total_utxo})  //push raw tx to the bitcoin network

        })

    })    

}


export function createTxSendBtc(sendData, callback){
    
    let btcTotalSats = sendData.amount + sendData.txFeeSatoshis
    console.log(btcTotalSats)
        
    getutxos(sendData.fromAddress, btcTotalSats, function(total_utxo, satoshi_change){ 
        
            if(total_utxo.length == 0){callback("error")}            

            var tx = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.bitcoin);   
            
            //inputs
            for (var i = 0; i < total_utxo.length; i++) {  
                tx.addInput(total_utxo[i].txid, total_utxo[i].vout) 
            }
            console.log(total_utxo);

            //outputs            
            tx.addOutput(sendData.toAddress, sendData.amount)

            if (satoshi_change > 5459) {
                tx.addOutput(sendData.fromAddress, satoshi_change)

            }

            var finalTx = tx.buildIncomplete().toHex();

            console.log(finalTx)
            
            callback({tx: finalTx, inputs: total_utxo})  //push raw tx to the bitcoin network

    })    

}
