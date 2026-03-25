/**
 * US State Sales Tax Rates (2026)
 * Source: Avalara State Rates (https://www.avalara.com/taxrates/en/state-rates.html)
 *
 * These are STATE-LEVEL rates. Local jurisdictions may add additional taxes,
 * but for online sellers, the state rate is the standard collection rate.
 *
 * Update annually — rates rarely change but check each January.
 */
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04,     // Alabama
  AK: 0,        // Alaska (no state sales tax)
  AZ: 0.056,    // Arizona
  AR: 0.065,    // Arkansas
  CA: 0.06,     // California (state portion only, locals add more)
  CO: 0.029,    // Colorado
  CT: 0.0635,   // Connecticut
  DE: 0,        // Delaware (no sales tax)
  FL: 0.06,     // Florida
  GA: 0.04,     // Georgia
  HI: 0.04,     // Hawaii
  ID: 0.06,     // Idaho
  IL: 0.0625,   // Illinois
  IN: 0.07,     // Indiana
  IA: 0.06,     // Iowa
  KS: 0.065,    // Kansas
  KY: 0.06,     // Kentucky
  LA: 0.0445,   // Louisiana
  ME: 0.055,    // Maine
  MD: 0.06,     // Maryland
  MA: 0.056,    // Massachusetts (6.25% effective but 5.6% as listed)
  MI: 0.06,     // Michigan
  MN: 0.06875,  // Minnesota
  MS: 0.07,     // Mississippi
  MO: 0.04225,  // Missouri
  MT: 0,        // Montana (no sales tax)
  NE: 0.055,    // Nebraska
  NV: 0.046,    // Nevada
  NH: 0,        // New Hampshire (no sales tax)
  NJ: 0.06625,  // New Jersey
  NM: 0.05125,  // New Mexico
  NY: 0.04,     // New York
  NC: 0.0475,   // North Carolina
  ND: 0.05,     // North Dakota
  OH: 0.0575,   // Ohio
  OK: 0.045,    // Oklahoma
  OR: 0,        // Oregon (no sales tax)
  PA: 0.06,     // Pennsylvania
  RI: 0.07,     // Rhode Island
  SC: 0.06,     // South Carolina
  SD: 0.045,    // South Dakota
  TN: 0.07,     // Tennessee
  TX: 0.0625,   // Texas
  UT: 0.047,    // Utah
  VT: 0.06,     // Vermont
  VA: 0.06,     // Virginia (4.3% state + 1% local + 0.7% NoVA regional)
  WA: 0.065,    // Washington
  WV: 0.06,     // West Virginia
  WI: 0.05,     // Wisconsin
  WY: 0.04,     // Wyoming
  DC: 0.06,     // District of Columbia
}

/**
 * States where PawLL LLC has Sales Tax nexus (registered to collect tax).
 * Currently: Virginia only (Certificate #10-412373941F-001, effective Mar 2026)
 *
 * To add a new state: register for Sales Tax in that state, then add the
 * state abbreviation here. Example: NEXUS_STATES.add('CA')
 */
export const NEXUS_STATES = new Set(['VA'])

/**
 * Full state name → abbreviation mapping
 * Supports users typing "Virginia" instead of "VA"
 */
const STATE_NAME_TO_ABBR: Record<string, string> = {
  ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA',
  COLORADO: 'CO', CONNECTICUT: 'CT', DELAWARE: 'DE', FLORIDA: 'FL', GEORGIA: 'GA',
  HAWAII: 'HI', IDAHO: 'ID', ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA',
  KANSAS: 'KS', KENTUCKY: 'KY', LOUISIANA: 'LA', MAINE: 'ME', MARYLAND: 'MD',
  MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN', MISSISSIPPI: 'MS', MISSOURI: 'MO',
  MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', OHIO: 'OH',
  OKLAHOMA: 'OK', OREGON: 'OR', PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
  'SOUTH DAKOTA': 'SD', TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT',
  VIRGINIA: 'VA', WASHINGTON: 'WA', 'WEST VIRGINIA': 'WV', WISCONSIN: 'WI', WYOMING: 'WY',
  'DISTRICT OF COLUMBIA': 'DC',
}

/**
 * Calculate sales tax for a given subtotal and shipping state.
 * Only charges tax in states where PawLL has nexus (NEXUS_STATES).
 *
 * @param subtotal - Order subtotal in USD
 * @param state - State abbreviation (e.g., "VA") or full name (e.g., "Virginia")
 * @returns { rate, amount, stateAbbr } — rate as decimal, amount in USD, resolved abbreviation
 */
export function calculateTax(subtotal: number, state: string): {
  rate: number
  amount: number
  stateAbbr: string
} {
  const normalized = state.trim().toUpperCase()
  const stateAbbr = STATE_NAME_TO_ABBR[normalized] || normalized

  if (!NEXUS_STATES.has(stateAbbr)) {
    return { rate: 0, amount: 0, stateAbbr }
  }

  const rate = STATE_TAX_RATES[stateAbbr] || 0
  const amount = Math.round(subtotal * rate * 100) / 100
  return { rate, amount, stateAbbr }
}
