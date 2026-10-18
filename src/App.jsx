import { lazy, Suspense, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ServicesGrid from './components/ServicesGrid.jsx'
import WorkSection from './components/WorkSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import QuoterPanel from './components/QuoterPanel.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import { useServices } from './hooks/useServices.js'
import { useQuoter } from './hooks/useQuoter.js'
import { normalizePhone } from './services/whatsappFormatter.js'
import { useAdminRoute } from './hooks/useAdminRoute.js'
import { defaultPricesApproved } from './data/initialServices.js'

const AdminPage = lazy(() => import('./components/AdminPage.jsx'))
const phoneNumber = normalizePhone(import.meta.env.VITE_WHATSAPP_NUMBER)

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showBefore, setShowBefore] = useState(false)
  const adminRoute = useAdminRoute()
  const catalog = useServices(adminRoute, !adminRoute)
  const quote = useQuoter({ phoneNumber })
  if (adminRoute) return <Suspense fallback={<p role="status" className="p-8">Cargando administración…</p>}><AdminPage /></Suspense>
  return (
    <>
      <a href="#contenido" className="sr-only z-50 rounded-sm bg-forest p-4 text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only">Saltar al contenido</a>
      <Navbar count={quote.count} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} onCloseMenu={() => setMenuOpen(false)} />
      <main id="contenido" onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false) }}>
        <Hero showBefore={showBefore} onCompare={setShowBefore} />
        <ServicesGrid services={catalog.services} activeCategory={catalog.activeCategory} onSelectCategory={catalog.setActiveCategory} search={catalog.search} onSearch={catalog.setSearch} onReset={catalog.resetFilters} items={quote.items} loading={catalog.loading} error={catalog.error} isDemo={!defaultPricesApproved} onAdd={(service) => quote.addItem(service, !defaultPricesApproved)} />
        <WorkSection />
        <AboutSection />
        <QuoterPanel quote={quote} hasWhatsApp={Boolean(phoneNumber)} />
        <ContactSection phoneNumber={phoneNumber} address={import.meta.env.VITE_BUSINESS_ADDRESS} hours={import.meta.env.VITE_BUSINESS_HOURS} />
      </main>
      <Footer />
      <p className="sr-only" role="status" aria-live="polite">{quote.count ? `${quote.count} prendas en tu presupuesto.` : ''}</p>
    </>
  )
}
