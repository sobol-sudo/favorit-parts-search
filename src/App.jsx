import SearchForm from './features/parts/SearchForm'
import Breadcrumbs from './features/parts/Breadcrumbs'
import BrandList from './features/parts/BrandList'
import OffersTable from './features/parts/OffersTable'

export default function App() {
  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <header className="mb-4">
        <h1 className="h3 mb-1">Подбор автозапчастей</h1>
        <p className="text-secondary mb-0">
          Введите артикул, выберите производителя — покажем аналоги, цены и остатки по складам.
        </p>
      </header>
      <SearchForm />
      <Breadcrumbs />
      <BrandList />
      <OffersTable />
    </div>
  )
}
