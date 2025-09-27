export function calculateROE(netIncome: number, shareholdersEquity: number): number | null {
  if (!shareholdersEquity || shareholdersEquity === 0) return null
  return (netIncome / shareholdersEquity) * 100
}

export function calculateROA(netIncome: number, totalAssets: number): number | null {
  if (!totalAssets || totalAssets === 0) return null
  return (netIncome / totalAssets) * 100
}

export function calculateROIC(netIncome: number, investedCapital: number): number | null {
  if (!investedCapital || investedCapital === 0) return null
  return (netIncome / investedCapital) * 100
}

export function calculateEPS(netIncome: number, sharesOutstanding: number): number | null {
  if (!sharesOutstanding || sharesOutstanding === 0) return null
  return (netIncome * 1000000) / (sharesOutstanding * 1000) // Convert millions to actual value
}

export function calculateDCF(
  cashFlows: number[],
  terminalValue: number,
  discountRate: number
): number {
  let presentValue = 0
  
  for (let i = 0; i < cashFlows.length; i++) {
    presentValue += cashFlows[i] / Math.pow(1 + discountRate / 100, i + 1)
  }
  
  if (terminalValue > 0 && cashFlows.length > 0) {
    presentValue += terminalValue / Math.pow(1 + discountRate / 100, cashFlows.length)
  }
  
  return presentValue
}

export function calculateTerminalValue(
  lastCashFlow: number,
  growthRate: number,
  discountRate: number
): number {
  if (discountRate <= growthRate) return 0
  return (lastCashFlow * (1 + growthRate / 100)) / ((discountRate - growthRate) / 100)
}

export function calculatePER(stockPrice: number, eps: number): number | null {
  if (!eps || eps === 0) return null
  return stockPrice / eps
}

export function calculatePBR(stockPrice: number, bookValuePerShare: number): number | null {
  if (!bookValuePerShare || bookValuePerShare === 0) return null
  return stockPrice / bookValuePerShare
}

export function calculateEVEBITDA(enterpriseValue: number, ebitda: number): number | null {
  if (!ebitda || ebitda === 0) return null
  return enterpriseValue / ebitda
}