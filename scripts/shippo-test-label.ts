/**
 * One-shot end-to-end test of the Shippo "buy a label" capability — the core
 * of the 打单 (label generation) half of the integration.
 *
 * Self-contained (raw fetch, hardcoded test addresses) so it doesn't depend on
 * any env config beyond the API key. Test-mode labels are FREE — no real
 * postage is purchased.
 *
 * Usage:
 *   npx tsx scripts/shippo-test-label.ts <shippo_test_api_key>
 *
 * What it does:
 *   1. POST /shipments/  -> get live rates (origin Arlington VA -> a CA address)
 *   2. pick the cheapest rate
 *   3. POST /transactions/ -> buy the label for that rate
 *   4. print tracking number + label PDF URL
 */

const apiKey = process.argv[2] || process.env.SHIPPO_API_KEY
if (!apiKey) {
  console.error('ERROR: pass your Shippo test key:\n  npx tsx scripts/shippo-test-label.ts shippo_test_xxx')
  process.exit(1)
}
if (!apiKey.startsWith('shippo_test_')) {
  console.error('WARNING: this does not look like a TEST key (shippo_test_…). Aborting to avoid buying a real label.')
  process.exit(1)
}

const BASE = 'https://api.goshippo.com'
const headers = {
  Authorization: `ShippoToken ${apiKey}`,
  'Content-Type': 'application/json',
}

async function main() {
  console.log('1/3  Fetching rates (Arlington VA -> San Francisco CA, 2 lb parcel)…')
  const shipmentRes = await fetch(`${BASE}/shipments/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      address_from: {
        name: 'PawLL Pet',
        street1: '1201 S Eads St',
        street2: 'Apt 1608',
        city: 'Arlington',
        state: 'VA',
        zip: '22202',
        country: 'US',
        phone: '703-555-0100',
      },
      address_to: {
        name: 'Test Customer',
        street1: '1 Market St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
        phone: '415-555-0100',
      },
      parcels: [
        { length: '10', width: '8', height: '4', distance_unit: 'in', weight: '2', mass_unit: 'lb' },
      ],
      async: false,
    }),
  })

  if (!shipmentRes.ok) {
    console.error('Rate request failed:', shipmentRes.status, await shipmentRes.text())
    process.exit(1)
  }

  const shipment = await shipmentRes.json()
  const rates = (shipment.rates || []) as Array<{
    object_id: string
    provider: string
    servicelevel: { name: string }
    amount: string
    currency: string
  }>

  if (!rates.length) {
    console.error('No rates returned:', JSON.stringify(shipment.messages || shipment, null, 2))
    process.exit(1)
  }

  rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
  console.log(`     got ${rates.length} rates. Options:`)
  for (const r of rates.slice(0, 6)) {
    console.log(`       - ${r.provider} ${r.servicelevel.name}: $${r.amount}`)
  }

  const chosen = rates[0]
  console.log(`\n2/3  Buying label for cheapest: ${chosen.provider} ${chosen.servicelevel.name} ($${chosen.amount})…`)

  const txRes = await fetch(`${BASE}/transactions/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ rate: chosen.object_id, label_file_type: 'PDF', async: false }),
  })

  if (!txRes.ok) {
    console.error('Transaction request failed:', txRes.status, await txRes.text())
    process.exit(1)
  }

  const tx = await txRes.json()
  if (tx.status !== 'SUCCESS') {
    console.error('Label purchase did not succeed:', JSON.stringify(tx.messages || tx, null, 2))
    process.exit(1)
  }

  console.log('\n3/3  ✅ LABEL PURCHASED')
  console.log('     carrier:        ', chosen.provider, chosen.servicelevel.name)
  console.log('     tracking number:', tx.tracking_number)
  console.log('     label PDF:      ', tx.label_url)
  console.log('     transaction id: ', tx.object_id)
  console.log('\nOpen the label PDF link in a browser to see the actual shipping label.')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
