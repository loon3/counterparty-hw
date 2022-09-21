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
      <PageTemplate hideLogoInFooter>
        <div className="pb-12">
            <Image src="/rarefakemerge.gif" height="200px" width="200px" alt=""/>
        </div>

        <div className={styles.grid}>



           <a href="#" className={styles.card} onClick={() => connectLedger()}>
              <h2>Connect &rarr;</h2>
              <p>Prior to connecting, you must download and open the Bitcoin app on your Ledger wallet device.</p>
            </a>

          
              <a href="https://wiki.pepe.wtf" target="_blank" className={styles.card}>
                <h2>About &rarr;</h2>
                <p>Visit the Book of Kek to learn more about the history of Rare Pepes and Bitcoin NFTs.</p>
              </a>
          

        </div>
      </PageTemplate>
  )
}
