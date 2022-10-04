import styles from '../styles/Home.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PageTemplate from '../components/template'
import Image from 'next/image'


export default function Home() {  
    
  const router = useRouter()    
  
  function connectLedger(){
//      window.localStorage.clear();
      router.push('/settings/select')
  }
    
  return (
      <PageTemplate hideLogoInFooter>
        <div className="pb-12">
            <Image src="/rarefakemerge.gif" height="200px" width="200px" alt=""/>
        </div>

        <div className={styles.grid}>



           <a href="#" className={styles.card} onClick={() => connectLedger()}>
              <h2>Wallet &rarr;</h2>
              <p>Use a 12-word passphrase or connect a Ledger hardware wallet device via USB.</p>
            </a>

          
              <a href="https://wiki.pepe.wtf" target="_blank" rel="noreferrer" className={styles.card}>
                <h2>About &rarr;</h2>
                <p>Visit the Book of Kek to learn more about the history of Rare Pepes and Bitcoin NFTs.</p>
              </a>
          

        </div>
      </PageTemplate>
  )
}
