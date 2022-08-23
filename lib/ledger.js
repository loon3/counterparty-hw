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

export async function getAddressLedger(callback){ 
    (async () => {
        try {
            //trying to connect to your Ledger device with USB protocol
            const transport = await TransportWebUSB.create();
            const appBtc = new AppBtc(transport);

            const { bitcoinAddress } = await appBtc.getWalletPublicKey(
              "44'/0'/0'/0/0",
              { verify: false, format: "legacy"}
            );

            var response = {status: "success", message: bitcoinAddress}    
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
              "44'/0'/0'/0/0",
              { verify: false, format: "legacy"}
            );

            if(bitcoinAddress != tx.address){callback({status: "error", message: "Transaction address doesn't match device"})}
            
            var inputsForDevice = []
            let keysForDevice = []
            for(const input of tx.inputsWithHex){
                var inputOnly = appBtc.splitTransaction(input[0],true);
                inputsForDevice.push([inputOnly, input[1]])
                keysForDevice.push("44'/0'/0'/0/0")
            }
            
            const txUnsignedSplit = appBtc.splitTransaction(tx.tx);
            const outputScriptHex = appBtc.serializeTransactionOutputs(txUnsignedSplit).toString('hex');
 
            appBtc.createPaymentTransactionNew({
                inputs: inputsForDevice,
                associatedKeysets: keysForDevice,
                outputScriptHex: outputScriptHex,
                additionals: []
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
              "44'/0'/0'/0/0",
              { verify: false, format: "legacy"}
            );

            if(bitcoinAddress != data.address){callback({status: "error", message: "Signing address doesn't match device"})}
            
            appBtc.signMessageNew("44'/0'/0'/0/0", Buffer.from(data.message).toString("hex")).then(function(result) {
                var v = result['v'] + 27 + 4;
                var signature = Buffer.from(v.toString(16) + result['r'] + result['s'], 'hex').toString('base64');
                console.log(signature)
                callback({"status": "success", "message": signature})
            }).catch(function(e){ callback(handleLedgerError(e)) })

        } catch (e) { callback(handleLedgerError(e)) }
    })();
}