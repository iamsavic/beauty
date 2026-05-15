import { addMinutes, format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'

export interface WorkingHours {
  start: string  // "09:00"
  end: string    // "17:00"
}

export interface ExistingAppointment {
  starts_at: string
  ends_at: string
}

export interface SlotCalculatorInput {
  date: Date
  workingHours: WorkingHours | null
  existingAppointments: ExistingAppointment[]
  serviceDuration: number
  slotIntervalMinutes?: number
}

export interface TimeSlot {
  time: string     // "09:00"
  datetime: Date
  isAvailable: boolean
}

export function calculateAvailableSlots({
  date,
  workingHours,
  existingAppointments,
  serviceDuration,
  slotIntervalMinutes = 15,
}: SlotCalculatorInput): TimeSlot[] {
  if (!workingHours) return []

  const dayStart = startOfDay(date)
  const [startHour, startMin] = workingHours.start.split(':').map(Number)
  const [endHour, endMin] = workingHours.end.split(':').map(Number)

  const workStart = new Date(dayStart)
  workStart.setHours(startHour, startMin, 0, 0)

  const workEnd = new Date(dayStart)
  workEnd.setHours(endHour, endMin, 0, 0)

  const slots: TimeSlot[] = []
  let current = workStart

  while (isBefore(current, workEnd)) {
    const slotEnd = addMinutes(current, serviceDuration)

    if (isAfter(slotEnd, workEnd)) break

    const isBooked = existingAppointments.some((appt) => {
      const apptStart = parseISO(appt.starts_at)
      const apptEnd = parseISO(appt.ends_at)
      return isBefore(current, apptEnd) && isAfter(slotEnd, apptStart)
    })

    const isPast = isBefore(current, new Date())

    slots.push({
      time: format(current, 'HH:mm'),
      datetime: new Date(current),
      isAvailable: !isBooked && !isPast,
    })

    current = addMinutes(current, slotIntervalMinutes)
  }

  return slots
}

export function getAvailableSlots(input: SlotCalculatorInput): TimeSlot[] {
  return calculateAvailableSlots(input).filter((s) => s.isAvailable)
}
