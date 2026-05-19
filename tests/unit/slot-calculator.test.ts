import { describe, it, expect } from 'vitest'
import { calculateAvailableSlots, getAvailableSlots } from '@/lib/booking/slot-calculator'

const WORKING_HOURS = { start: '09:00', end: '17:00' }

function makeAppt(startHour: number, durationMin: number) {
  const d = new Date('2030-06-10')
  const start = new Date(d)
  start.setHours(startHour, 0, 0, 0)
  const end = new Date(start.getTime() + durationMin * 60000)
  return { starts_at: start.toISOString(), ends_at: end.toISOString() }
}

describe('calculateAvailableSlots', () => {
  it('vraća praznu listu ako nema radnog vremena', () => {
    const slots = calculateAvailableSlots({
      date: new Date('2030-06-10'),
      workingHours: null,
      existingAppointments: [],
      serviceDuration: 60,
    })
    expect(slots).toEqual([])
  })

  it('vraća slotove unutar radnog vremena', () => {
    const slots = calculateAvailableSlots({
      date: new Date('2030-06-10'),
      workingHours: WORKING_HOURS,
      existingAppointments: [],
      serviceDuration: 60,
      slotIntervalMinutes: 60,
    })
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].time).toBe('09:00')
    expect(slots[slots.length - 1].time).toBe('16:00')
  })

  it('isključuje zauzete termine iz dostupnih slotova', () => {
    const slots = calculateAvailableSlots({
      date: new Date('2030-06-10'),
      workingHours: WORKING_HOURS,
      existingAppointments: [makeAppt(10, 60)],
      serviceDuration: 60,
      slotIntervalMinutes: 60,
    })
    const times = slots.filter((s) => s.isAvailable).map((s) => s.time)
    expect(times).not.toContain('10:00')
    expect(times).toContain('09:00')
    expect(times).toContain('11:00')
  })

  it('ne vraća slotove koji ne staju u radno vreme', () => {
    const slots = getAvailableSlots({
      date: new Date('2030-06-10'),
      workingHours: { start: '09:00', end: '10:00' },
      existingAppointments: [],
      serviceDuration: 90,
    })
    expect(slots).toHaveLength(0)
  })

  it('vraća slot koji upravo staje do kraja radnog vremena', () => {
    const slots = getAvailableSlots({
      date: new Date('2030-06-10'),
      workingHours: { start: '09:00', end: '10:00' },
      existingAppointments: [],
      serviceDuration: 60,
      slotIntervalMinutes: 60,
    })
    expect(slots).toHaveLength(1)
    expect(slots[0].time).toBe('09:00')
  })
})
