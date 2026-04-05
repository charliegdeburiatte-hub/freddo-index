import Nav from '../components/layout/Nav'
import Footer from '../components/layout/Footer'

const Section = ({ title, children }) => (
  <div className="mb-6">
    <p className="text-sm font-semibold mb-2" style={{ color: '#F2F2F2' }}>{title}</p>
    <div className="text-sm italic space-y-1" style={{ color: '#A0A0A0' }}>{children}</div>
  </div>
)

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        <div className="panel">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#A0A0A0' }}>
            A Note On Accuracy
          </p>
          <p className="text-sm italic mb-8" style={{ color: '#555555' }}>
            Or: what you get when you ask frogs to track global economics.
          </p>

          <p className="text-sm mb-6" style={{ color: '#A0A0A0' }}>
            The data presented on The Freddo Index is sourced from publicly available government
            publications, official regulatory bodies, and supermarket product pages. We do our best
            to keep it accurate, current, and presented in the most useful unit of measurement
            available: the Freddo.
          </p>
          <p className="text-sm italic mb-8" style={{ color: '#555555' }}>However:</p>

          <Section title="On government data:">
            <p>BEIS, Ofgem, ONS, the Land Registry, Ofcom, and Water UK publish data on their
            own schedules. We fetch it promptly. If they're late, we're late. We have written
            to them about this. They have not replied.</p>
          </Section>

          <Section title="On supermarket scrapers:">
            <p>Prices are scraped daily from the following supermarkets, each presenting their
            own unique operational character:</p>
            <ul className="mt-2 space-y-1 list-none">
              {[
                ["Sainsbury's", "reliable until they redesign the website for no reason"],
                ["Tesco", "fine, but Clubcard pricing means nothing is ever the real price"],
                ["Asda", "surprisingly straightforward. We respect it."],
                ["Morrisons", "moves products around their website like they're trying to lose us specifically (ew)"],
                ["Co-op", "prices appear to be updated by someone who hates you personally"],
                ["Waitrose", "works perfectly. Costs us emotionally every time we see the numbers."],
                ["Iceland", "surprisingly solid. Mums everywhere vindicated."],
                ["Ocado", "functions flawlessly. We feel judged the entire time."],
              ].map(([name, note]) => (
                <li key={name}><span style={{ color: '#F2F2F2' }}>{name}</span> — {note}</li>
              ))}
            </ul>
            <p className="mt-3">If a scraper fails, the last known good price is displayed with a
            timestamp. The site does not go down because Morrisons moved a button.</p>
          </Section>

          <Section title="On the Freddo price itself:">
            <p>The national average Freddo price is calculated from all available supermarket
            sources daily. If you find a Freddo for less than the listed price, congratulations.
            Please report it to no one. Just enjoy the Freddo.</p>
          </Section>

          <Section title="On historical data:">
            <p>Historical prices are sourced from official publications where available. We do
            not invent data. We do not need to — the real data is already sufficiently alarming.</p>
          </Section>

          <Section title="On the Freddo conversion itself:">
            <p>All conversions use the current national average Freddo price. The maths is
            correct. The implications are your problem.</p>
          </Section>

          {/* The frog thumb clause — the most important paragraph */}
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: 'rgba(76,175,80,0.3)' }}>
            <p className="text-base italic mb-2" style={{ color: '#F2F2F2' }}>
              Any errors, inaccuracies, or miscalculations are not the fault of the development team.
            </p>
            <p className="text-base italic mb-2" style={{ color: '#F2F2F2' }}>
              Frogs do not have thumbs.
            </p>
            <p className="text-base italic mb-4" style={{ color: '#F2F2F2' }}>
              We did our best.
            </p>
            <p className="text-3xl">🐸</p>
          </div>

          <p className="text-xs italic text-center mt-8" style={{ color: '#555555' }}>
            The Freddo Index is not financial advice. No frogs were harmed. Several Freddos were.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
