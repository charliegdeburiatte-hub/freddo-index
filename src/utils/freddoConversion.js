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
