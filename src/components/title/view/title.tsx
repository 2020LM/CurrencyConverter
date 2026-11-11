import styles from './title.module.css'

export const Title = () => {
  return (
    <>
      <h1 className={styles.title}>Currency Converter</h1>
      <h5 className={styles.subtitle}>Convert currencies quickly and easily</h5>
    </>
  )
}

export default Title