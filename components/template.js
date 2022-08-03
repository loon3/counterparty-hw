import React, { Component } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function PageTemplate(props) {
    
    return (   
        <div className={styles.container}>
            <Head>
                <title>Counterparty HW</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navigation address={props.address} btc={props.btc}/>
            <main className={styles.main}>
                {props.children}
            </main>
            <footer className={styles.footer}>
                Counterparty HW - Powered by Bitcoin and Counterparty 
            </footer>
        </div>
    )

}

export function Navigation(props) {
    
    if(props.btc) {
        return (   
            <div className="w-full fixed h-[58px] bg-white">
                <div className="absolute top-4 right-6 inline-block">
                    <div className="inline-block font-bold">{props.address}</div>
                    <div className="inline-block mx-2"> &#47;&#47; </div>
                    <div className="inline-block">{props.btc.confirmed} BTC</div>
                    {props.btc.unconfirmed < 0 &&
                        <div className="inline-block mx-1 text-red-400">
                        &#40;
                            {props.btc.unconfirmed}
                        &#41;
                        </div>
                    }
                    {props.btc.unconfirmed > 0 &&
                        <div className="inline-block mx-1 text-green-600">
                        &#40;&#43;
                            {props.btc.unconfirmed}
                        &#41;
                        </div>
                    }
                </div>
            </div>
        )
    } else {
        return (<div></div>)
    }

}