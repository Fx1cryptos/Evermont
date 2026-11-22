// Platform default, not a payable quote. Call only with an independently approved basis.
// Integers represent the currency's smallest unit, so no binary floating-point rounding occurs.
export const defaultActivationRate = { decimal: '0.008', numerator: 8n, denominator: 1000n } as const
export const defaultActivationPercent = `${Number(defaultActivationRate.decimal) * 100}%`
export function defaultFeeMinorUnits(approvedBasisMinorUnits: bigint): bigint {
  if (approvedBasisMinorUnits < 0n) throw new RangeError('Basis must be nonnegative')
  const { numerator, denominator } = defaultActivationRate
  return (approvedBasisMinorUnits * numerator + denominator / 2n) / denominator
}
