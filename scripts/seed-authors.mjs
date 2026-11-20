// Loads sample authors into the backend so the Authors page has data.
// Run with `npm run seed` while the backend is up. Safe to run again:
// authors that already exist (same first and last name) are skipped.
const API_URL = process.env.VITE_API_URL ?? 'http://localhost:8000'

const SAMPLE_AUTHORS = [
  ['J.K.', 'Rowling'],
  ['Suzanne', 'Collins'],
  ['Khaled', 'Hosseini'],
  ['John', 'Green'],
  ['Harper', 'Lee'],
  ['J.R.R.', 'Tolkien'],
  ['Jane', 'Austen'],
  ['Veronica', 'Roth'],
  ['Ursula K.', 'Le Guin'],
  ['Octavia E.', 'Butler'],
  ['Toni', 'Morrison'],
  ['Gabriel', 'García Márquez'],
  ['Chimamanda Ngozi', 'Adichie'],
  ['George', 'Orwell'],
]

async function existingNames() {
  const names = new Set()
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${API_URL}/authors?limit=100&offset=${offset}`)
    if (!res.ok) throw new Error(`GET /authors failed: ${res.status}`)
    const { items, total } = await res.json()
    for (const a of items) names.add(`${a.first_name}|${a.last_name}`)
    if (offset + items.length >= total) return names
  }
}

const have = await existingNames().catch((err) => {
  console.error(`Can't reach the API at ${API_URL}. Start the backend first.\n${err.message}`)
  process.exit(1)
})

let added = 0
for (const [first_name, last_name] of SAMPLE_AUTHORS) {
  if (have.has(`${first_name}|${last_name}`)) continue
  const res = await fetch(`${API_URL}/authors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name }),
  })
  if (!res.ok) {
    console.error(`Could not add ${first_name} ${last_name}: ${res.status} ${await res.text()}`)
    process.exitCode = 1
    continue
  }
  added++
}
console.log(`Added ${added} sample authors (${SAMPLE_AUTHORS.length - added} already there).`)
