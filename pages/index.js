import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'



export default function Home() {  
    
  const router = useRouter()    
  
  function connectLedger(){
      window.sessionStorage.clear();
      router.push('/connect')
  }
    
  return (
      <PageTemplate>
        <h1 className={styles.title}>
          Counterparty HW
        </h1>

        <p className={styles.description}>
          Send Counterparty assets (rare pepes, fake rares, dank rares and more) from your Ledger Nano S or Nano X hardware wallet
        </p>

        <div className={styles.grid}>
          <Link href="/setup">
              <a href="#" className={styles.card}>
                <h2>Setup (READ FIRST!) &rarr;</h2>
                <p>Instructions for setting up your Ledger wallet to receive Counterparty assets.</p>
              </a>
          </Link>


           <a href="#" className={styles.card} onClick={() => connectLedger()}>
              <h2>Connect &rarr;</h2>
              <p>Prior to connecting, please setup your Ledger wallet per the instructions above.</p>
            </a>

        </div>
      </PageTemplate>
  )
}
