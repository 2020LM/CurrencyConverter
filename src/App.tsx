// Internal imports
import styles from './App.module.css'
import Title from './components/title/view/title.tsx'
import SmallBanner from './components/smallBanner/view/smallBanner.tsx'
import Converter from './components/converter/view/converter.tsx'

// External imports

function App() {


  return (
    <div className={styles.app}>
      <div>
        <Title />
      </div>
      <div className={styles.content}>
        <Converter />
      </div>
      <div className={styles.content}>
        <SmallBanner />
      </div>
    </div>
  )
}

export default App
