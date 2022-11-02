//import "babel-polyfill";

import AppBtc from "@ledgerhq/hw-app-btc";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

function handleLedgerError(e){
    console.log(e)
    console.log(e.message)
    
    let responseMessage = "Error"
    
    if(e.message){
        responseMessage = e.message

        if(responseMessage == "Invalid sequence" || responseMessage == "Invalid channel"){responseMessage = "Refresh to continue..."}
        if(responseMessage == "Failed to execute 'open' on 'USBDevice': An operation that changes the device state is in progress."){responseMessage = "Loading..."}
        if(e.statusCode == 25873 || e.statusCode == 27010 || responseMessage == "Failed to execute 'requestDevice' on 'USB': Must be handling a user gesture to show a permission request."){responseMessage = "Ensure your Ledger device is connected via USB and the Bitcoin app is open."} 
        
    } 
    
    let response = {status: "error", message: responseMessage}      
    
    return response
    
}

export async function getAddressSelectLedger(callback){ 
    (async () => {
        try {
            //trying to connect to your Ledger device with USB protocol
            const transport = await TransportWebUSB.create();
            const appBtc = new AppBtc(transport);
             
            let legacy = [];
            let bech32 = [];

            for(let i = 0; i < 2; i++){
                
                let derivationPath = "44'/0'/"+i+"'/0/0"
                
                let { bitcoinAddress } = await appBtc.getWalletPublicKey(
                  derivationPath,
                  { verify: false, format: "legacy"}
                );
            
                legacy[i] = {address: bitcoinAddress, format: "legacy", formatType: "LEGACY", derivationPath: derivationPath, index: i, key: "ledger"}
            }
            
            for(let i = 0; i < 2; i++){
                
                let derivationPath = "84'/0'/"+i+"'/0/0"
                
                let { bitcoinAddress } = await appBtc.getWalletPublicKey(
                  derivationPath,
                  { verify: false, format: "bech32"}
                );
            
                bech32[i] = {address: bitcoinAddress, format: "bech32", formatType: "NATIVE SEGWIT", derivationPath: derivationPath, index: i, key: "ledger"}
            }
            

            var response = {status: "success", message: [...legacy, ...bech32]}    
            callback(response)

        } catch (e) { callback(handleLedgerError(e)) }
    })();
}

export async function getAddressFromPathLedger(format, index, callback){ 
    
    let derivationPath = null
    let formatType = null
    
    if(format == "legacy"){ 
        derivationPath = "44'/0'/"+index+"'/0/0" 
        formatType = "LEGACY"
    }
    if(format == "bech32"){ 
        derivationPath = "84'/0'/"+index+"'/0/0"
        formatType = "NATIVE SEGWIT"
    }
      
    (async () => {
        try {
            //trying to connect to your Ledger device with USB protocol
            const transport = await TransportWebUSB.create();
            const appBtc = new AppBtc(transport);

            const { bitcoinAddress } = await appBtc.getWalletPublicKey(
              derivationPath,
              { verify: false, format: format}
            );
            
            let message = {address: bitcoinAddress, format: format, formatType: formatType, derivationPath: derivationPath, index: index, key: "ledger"}

            let response = {status: "success", message: message}    
            callback(response)

        } catch (e) { callback(handleLedgerError(e)) }
    })();
}

export async function sendAssetLedger(tx, callback){ 
    (async () => {
        try {
            //trying to connect to your Ledger device with USB protocol
            const transport = await TransportWebUSB.create();
            const appBtc = new AppBtc(transport);

            const { bitcoinAddress } = await appBtc.getWalletPublicKey(
              tx.derivationPath,
              { verify: false, format: tx.format}
            );

            if(bitcoinAddress != tx.address){callback({status: "error", message: "Transaction address doesn't match device"})}
            
            var inputsForDevice = []
            let keysForDevice = []
            for(const input of tx.inputsWithHex){
                var inputOnly = appBtc.splitTransaction(input[0],true);
                inputsForDevice.push([inputOnly, input[1]])
                keysForDevice.push(tx.derivationPath)
            }
            
            const txUnsignedSplit = appBtc.splitTransaction(tx.tx);
            const outputScriptHex = appBtc.serializeTransactionOutputs(txUnsignedSplit).toString('hex');
 
            let additionals = []
            if(tx.format == "bech32"){ additionals = ["bech32"]}
            
            appBtc.createPaymentTransactionNew({
                inputs: inputsForDevice,
                associatedKeysets: keysForDevice,
                outputScriptHex: outputScriptHex,
                additionals: additionals
            }).then(function(result) {
                callback({status: "success", message: result})   
                console.log(result)
            }).catch(function(e){ callback(handleLedgerError(e)) })  

        } catch (e) { callback(handleLedgerError(e)) }
    })();
}

export async function signMessageLedger(data, callback){ 
    (async () => {
        try {

            //trying to connect to your Ledger device with USB protocol
            const transport = await TransportWebUSB.create();
            const appBtc = new AppBtc(transport);

            const { bitcoinAddress } = await appBtc.getWalletPublicKey(
              data.derivationPath,
              { verify: false, format: data.format}
            );

            if(bitcoinAddress != data.address){callback({status: "error", message: "Signing address doesn't match device"})}
            
            appBtc.signMessageNew(data.derivationPath, Buffer.from(data.message).toString("hex")).then(function(result) {
                var v = result['v'] + 27 + 4;
                var signature = Buffer.from(v.toString(16) + result['r'] + result['s'], 'hex').toString('base64');
                console.log(signature)
                callback({"status": "success", "message": signature})
            }).catch(function(e){ callback(handleLedgerError(e)) })

        } catch (e) { callback(handleLedgerError(e)) }
    })();
}