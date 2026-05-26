/**
 * One-shot CLI helper: list all sender/return addresses stored in your Shippo
 * account, along with their object_ids. Pick the object_id of your default
 * sender address and set it as SHIPPO_FROM_ADDRESS_ID in your env.
 *
 * Why this exists:
 *   Shippo's dashboard doesn't expose object_ids directly. To use Shippo's
 *   stored-address feature (instead of duplicating address fields in Vercel
 *   env vars), you need the object_id. This script just calls
 *   GET https://api.goshippo.com/addresses/ and prints the relevant fields.
 *
 * Usage:
 *   npx tsx scripts/shippo-list-addresses.ts <shippo_test_or_live_key>
 *
 *   or:
 *
 *   $env:SHIPPO_API_KEY = "shippo_test_xxx"
 *   npx tsx scripts/shippo-list-addresses.ts
 */

const apiKey = process.argv[2] || process.env.SHIPPO_API_KEY

if (!apiKey) {
  console.error('ERROR: No Shippo API key provided.')
  console.error('')
  console.error('Usage:')
  console.error('  npx tsx scripts/shippo-list-addresses.ts <shippo_api_key>')
  console.error('')
  console.error('Or set SHIPPO_API_KEY in your environment and re-run.')
  process.exit(1)
}

interface ShippoAddressListResponse {
  count: number
  next?: string | null
  previous?: string | null
  results: Array<{
    object_id: string
    name?: string | null
    company?: string | null
    street1?: string | null
    street2?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    country?: string | null
    phone?: string | null
    email?: string | null
    is_residential?: boolean | null
    validation_results?: { is_valid?: boolean } | null
  }>
}

async function main() {
  console.log('Fetching addresses from Shippo...\n')

  const res = await fetch('https://api.goshippo.com/addresses/?results=50', {
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`ERROR: Shippo returned ${res.status} ${res.statusText}`)
    console.error(body.slice(0, 500))
    process.exit(1)
  }

  const data = (await res.json()) as ShippoAddressListResponse

  if (!data.results?.length) {
    console.log('No addresses found in this Shippo account.')
    console.log('Add one at https://apps.goshippo.com/settings/addresses first.')
    process.exit(0)
  }

  console.log(`Found ${data.results.length} address(es):\n`)
  console.log('═'.repeat(80))

  for (const a of data.results) {
    console.log(`object_id : ${a.object_id}`)
    console.log(`name      : ${a.name || '(none)'}`)
    if (a.company) console.log(`company   : ${a.company}`)
    console.log(`street    : ${a.street1 || ''}${a.street2 ? ' ' + a.street2 : ''}`)
    console.log(`city/zip  : ${a.city || ''}, ${a.state || ''} ${a.zip || ''} ${a.country || ''}`)
    if (a.phone) console.log(`phone     : ${a.phone}`)
    if (a.validation_results) {
      console.log(`validated : ${a.validation_results.is_valid ? 'yes' : 'no'}`)
    }
    console.log('─'.repeat(80))
  }

  console.log('')
  console.log('Pick the object_id of your default SENDER address and set it in Vercel as:')
  console.log('  SHIPPO_FROM_ADDRESS_ID=adr_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  console.log('')
  console.log('(If you also want a separate return address, you can set SHIPPO_RETURN_ADDRESS_ID')
  console.log(' later — for now we use the same address for both ship-from and returns.)')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
