import styles from '../styles/Home.module.css'
import Link from 'next/link';
import PageTemplate from '../components/template'

export default function SetupInstructions() {
  return (
  <PageTemplate>
        <h1 className={styles.setupTitle}>
          Setting up your Ledger
        </h1>

        <div className={styles.steps}>
          <div className="inline-block font-bold">Step 1:</div> Initialize your Ledger device and download the Bitcoin app
        </div>
      
        <div className={styles.steps}>
          <div className="inline-block font-bold">Step 2:</div> In the Bitcoin app, add an account then click on the <div className="inline-block italic">Show all address types</div> toggle
        </div>
      
        <div className={styles.steps}>
          <div className="inline-block font-bold">Step 3:</div> Select <div className="inline-block italic">Legacy</div> address and add the account.  This is the address that will connect to Counterparty-HW.
        </div>
      
        <div className="mb-4">
        <div className={styles.steps}>
          Counterparty-HW connects only to the first Legacy address generated by the Ledger device.  The BIP 32 derivation path is 44&apos;/0&apos;/0&apos;/0/0.
        </div>
        </div>

        <div className={styles.grid}>
            <Link href="/">
              <a href="#" className={styles.card}>
                <p>&larr; Back to home</p>
              </a>
            </Link>
        </div>
    </PageTemplate>
  )
}
