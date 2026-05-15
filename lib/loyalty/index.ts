export interface LoyaltyPointsInput {
  servicePrice: number
  pointsPerKM: number
}

export function calculateLoyaltyPoints({ servicePrice, pointsPerKM }: LoyaltyPointsInput): number {
  return Math.floor(servicePrice * pointsPerKM)
}

export interface CanRedeemInput {
  currentPoints: number
  threshold: number
}

export function canRedeemReward({ currentPoints, threshold }: CanRedeemInput): boolean {
  return currentPoints >= threshold
}

export function pointsToDiscount(points: number, pointValue: number): number {
  return points * pointValue
}
