import styles from './smallBanner.module.css'
import globeIcon from '../../../assets/globe-americas.svg'
import shieldIcon from '../../../assets/shield-check.svg'
import lightningIcon from '../../../assets/lightning-charge.svg'

export const SmallBanner = () => {
  return (
    <div className={styles.bannerGrid}>
      <div className={styles.card}>
        <h2 className={styles.title}>Global</h2>
        <img className={styles.icon} src={globeIcon} alt="" />
        <p className={styles.description}>Convert currencies from different countries.</p>
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>Trusted rates</h2>
        <img className={styles.icon} src={shieldIcon} alt="" />
        <p className={styles.description}>Exchange rates from a reliable source.</p>
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>Fast results</h2>
        <img className={styles.icon} src={lightningIcon} alt="" />
        <p className={styles.description}>Get results quickly as you type.</p>
      </div>
    </div>
  )
}

export default SmallBanner