// All Freddo conversion logic lives here.
// Never calculate conversions inline in components.
// Always use the national average Freddo price — never a single supermarket price.

const RICE_GRAIN_WEIGHT_GRAMS = 0.025

// How many Freddos does this cost?
export const toFreddos = (pricePence, freddoPricePence) =>
  pricePence / freddoPricePence

// How many of this item does one Freddo buy?
export const perFreddo = (pricePence, freddoPricePence) =>
  freddoPricePence / pricePence

// How many grains of rice does one Freddo buy?
export const grainsPerFreddo = (bagPricePence, bagWeightGrams, freddoPricePence) => {
  const totalGrains = bagWeightGrams / RICE_GRAIN_WEIGHT_GRAMS
  const pricePerGrain = bagPricePence / totalGrains
  return freddoPricePence / pricePerGrain
}

// --- Lifetime conversions ---------------------------------------------------
// All inputs are integers in pence except yearsOfLife (decimal years).
// Why these live here: project rule — every Freddo conversion is in this file.

// Lifetime gross earnings expressed in Freddos
//   yearsOfLife       — life expectancy at birth, decimal years
//   annualWagePence   — median annual gross earnings, integer pence
//   freddoPricePence  — current national average Freddo price, integer pence
export const lifetimeFreddos = (yearsOfLife, annualWagePence, freddoPricePence) =>
  (yearsOfLife * annualWagePence) / freddoPricePence

// Difference between two lifetimes in Freddos.
// Used by the postcode-gap card (Blackpool vs Kensington).
export const lifetimeFreddosGap = (yearsA, yearsB, annualWagePence, freddoPricePence) =>
  Math.abs(
    lifetimeFreddos(yearsA, annualWagePence, freddoPricePence)
    - lifetimeFreddos(yearsB, annualWagePence, freddoPricePence)
  )

// Freddos earned per real-world minute at median wage.
// Why calendar minutes (not working hours): a "lifetime in Freddos" is calendar
// time — you're not paid for sleeping, but the years pass anyway. The ticker
// answers "how many Freddos has the universe handed me since I opened this tab".
export const freddosPerMinute = (annualWagePence, freddoPricePence) =>
  (annualWagePence / (365.25 * 24 * 60)) / freddoPricePence

// Freddos accrued over a span of calendar minutes at median wage.
// Wraps freddosPerMinute so the ticker component contains zero arithmetic.
export const freddosAccrued = (elapsedMinutes, annualWagePence, freddoPricePence) =>
  elapsedMinutes * freddosPerMinute(annualWagePence, freddoPricePence)
