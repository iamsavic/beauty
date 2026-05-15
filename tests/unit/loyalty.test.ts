import { describe, it, expect } from 'vitest'
import { calculateLoyaltyPoints, canRedeemReward, pointsToDiscount } from '@/lib/loyalty'

describe('Loyalty sistem', () => {
  it('dodjeljuje ispravne bodove za uslugu', () => {
    expect(calculateLoyaltyPoints({ servicePrice: 50, pointsPerKM: 1 })).toBe(50)
    expect(calculateLoyaltyPoints({ servicePrice: 50, pointsPerKM: 2 })).toBe(100)
    expect(calculateLoyaltyPoints({ servicePrice: 35, pointsPerKM: 1 })).toBe(35)
  })

  it('zaokružuje bodove prema dolje', () => {
    expect(calculateLoyaltyPoints({ servicePrice: 33.5, pointsPerKM: 1 })).toBe(33)
  })

  it('canRedeemReward vraća true samo ako ima dovoljno bodova', () => {
    expect(canRedeemReward({ currentPoints: 100, threshold: 100 })).toBe(true)
    expect(canRedeemReward({ currentPoints: 101, threshold: 100 })).toBe(true)
    expect(canRedeemReward({ currentPoints: 99, threshold: 100 })).toBe(false)
    expect(canRedeemReward({ currentPoints: 0, threshold: 100 })).toBe(false)
  })

  it('pointsToDiscount ispravno konvertuje bodove u iznos', () => {
    expect(pointsToDiscount(100, 0.1)).toBeCloseTo(10)
    expect(pointsToDiscount(50, 0.2)).toBeCloseTo(10)
  })
})
