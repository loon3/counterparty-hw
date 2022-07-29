import React, { Component } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'

class PageTemplate extends Component {
    constructor(props) {
        super(props);
    }

    render() {
    return (   
    <div className={styles.container}>
      <Head>
        <title>Counterparty HW</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {this.props.children}
      </main>

      <footer className={styles.footer}>
       
          Counterparty HW - Powered by Bitcoin and Counterparty
         
      </footer>
    </div>
  )
}
}

export default PageTemplate;
