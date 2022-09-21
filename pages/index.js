import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'
import Image from 'next/image'


export default function Home() {  
    
  const router = useRouter()    
  
  function connectLedger(){
      window.localStorage.clear();
      router.push('/settings/select-address')
  }
    
  return (
      <PageTemplate>
        <div>
            <Image src="/rarefakemerge.gif" height="200px" width="200px" alt=""/>
        </div>
        <h1 className="text-5xl pt-6 pb-20 font-black">
          Rare Pepe Wallet .wtf
        </h1>
        <div className={styles.grid}>
          <Link href="/setup">
              <a href="#" className={styles.card}>
                <h2>Setup (READ FIRST!) &rarr;</h2>
                <p>Instructions for setting up your Ledger wallet to receive rares and fakes.</p>
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
