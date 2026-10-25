import SearchForm from './features/parts/SearchForm'
import Breadcrumbs from './features/parts/Breadcrumbs'
import BrandList from './features/parts/BrandList'
import OffersTable from './features/parts/OffersTable'

const CONTAINER_STYLE = { maxWidth: 1100 }

export default function App() {
  return (
    <>
      <header className="app-header py-4 mb-4">
        <div className="container" style={CONTAINER_STYLE}>
          <h1 className="h3 mb-1">Подбор автозапчастей</h1>
          <p className="subtitle mb-0">
            Введите артикул, выберите производителя — покажем аналоги, цены и остатки по складам.
          </p>
        </div>
      </header>
      <main className="container pb-4" style={CONTAINER_STYLE}>
        <SearchForm />
        <Breadcrumbs />
        <BrandList />
        <OffersTable />
      </main>
    </>
  )
}
