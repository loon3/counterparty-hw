import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from 'next/link';

export default function SetupInstructions() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Counterparty HW - Setup Instructions</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Setting up your Ledger
        </h1>

        <p className={styles.description}>
          Step 1: ...
        </p>

        <div className={styles.grid}>
            <Link href="/">
              <a href="#" className={styles.card}>
                <p>&larr; Back to home</p>
              </a>
            </Link>
        </div>
      </main>

     
    </div>
  )
}
