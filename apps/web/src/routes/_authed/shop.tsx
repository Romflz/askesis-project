import { createFileRoute, Link } from '@tanstack/react-router'
import { Coins, Store } from 'lucide-react'

// Placeholder until coins can be spent; the top bar's coin pill links here.
export const Route = createFileRoute('/_authed/shop')({
  head: () => ({ meta: [{ title: 'Shop · Askesis' }] }),
  component: Shop,
})

function Shop() {
  return (
    <main className="shop-page">
      <section className="panel shop-soon" aria-labelledby="shop-title">
        <span className="shop-soon__icon" aria-hidden>
          <Store size={28} />
        </span>
        <p className="eyebrow">Shop</p>
        <h1 id="shop-title" className="shop-soon__title">
          Coming soon
        </h1>
        <p className="shop-soon__text">
          A place to spend the coins you earn from chests, quests and lucky finds. It isn’t open yet, and every coin you earn
          until then stays in your balance.
        </p>
        <p className="shop-soon__note">
          <Coins size={15} aria-hidden /> Keep studying to build up your coins.
        </p>
        <Link to="/dashboard" className="btn btn--primary">
          Back to the dashboard
        </Link>
      </section>
    </main>
  )
}
