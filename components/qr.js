import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { checkIfValidAddress } from "../lib/xcp.js"



export default function TestQr(props) {
    
  const [facing, setFacing] = useState({facingMode: "environment"})
    

//  useEffect(() => {
//      const detectRearCamera = async () => {
//          try {
//              const hasRearCamera = await navigator.mediaDevices.getUserMedia({
//                  video: { facingMode: { exact: "environment" } },
//              })
//              if (hasRearCamera) {
//                  setFacing({facingMode: "environment"})
//              }
//          } catch {
//          }
//      };
//      detectRearCamera();
//  }, [])

  return (
    <>
      <QrReader
        constraints={facing}
        onResult={(result, error) => {
          if (!!result) {
              if(checkIfValidAddress(result?.text)){
                  props.setQrCode({status: "success", address: result?.text});                
              } 
          }

          if (!!error) {
            console.log(error)
          }
        }}
        style={{ width: '100%' }}
      />
    <div className="w-full text-center pb-6" onClick={() => props.setQrCode({status: null, address: null})}>
       <button className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Close QR Scan
                </button> 
</div>
    </>
  );
};