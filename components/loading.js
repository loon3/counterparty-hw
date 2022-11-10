import { MutatingDots, ThreeDots } from 'react-loader-spinner'
import styles from '../styles/Home.module.css'

export default function Loading(){
    
    return (
            <div className={styles.centered}>
                <ThreeDots 
                    height="80" 
                    width="80" 
                    radius="9"
                    color="#4fa94d" 
                    ariaLabel="three-dots-loading"
                />
            </div>
    )
//                <MutatingDots 
//                  height="100"
//                  width="100"
//                  color="#4fa94d"
//                  secondaryColor= '#4fa94d'
//                  radius='12.5'
//                  ariaLabel="mutating-dots-loading"
//
//                 />    
    

}