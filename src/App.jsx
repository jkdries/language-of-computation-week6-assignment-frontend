import Header from './components/Header.jsx'
import AuthorsPage from './pages/AuthorsPage.jsx'

export default function App() {
  return (
    <>
      <Header current="authors" />
      <AuthorsPage />
    </>
  )
}
