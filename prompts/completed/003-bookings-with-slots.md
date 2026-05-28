<objective>
Implement the core of the system: bookings (записи) with generated time slots. Clients pick an
organization, a service, and a master; the backend computes available time slots from the master's
working hours and the service duration, and lets the client book a free slot. Bookings move through
a status lifecycle. This is the centerpiece of the diploma project — it must be correct and
defensible, but still simple.
</objective>

<context>
- Prerequisites: prompts 001 and 002 applied. Available now: Organization (ownerId), Service
  (organizationId, durationMinutes, isActive), OrganizationStaff, StaffService (which services a
  master provides), and Schedule/WorkingHours (per master, per dayOfWeek, startTime/endTime "HH:mm").
- Decision: SLOT-BASED scheduling. Slots are derived, not stored ahead of time.
- Match existing conventions; there is no CLAUDE.md.

Examine before writing:
@src/services/service.model.ts
@src/staff/schedule.model.ts
@src/staff/staff-service.model.ts
@src/organization/organization.model.ts
@src/users/users/users.model.ts
@src/app.module.ts
</context>

<conventions>
Same as prompts 001–002: sequelize-typescript models with `declare` + `@ApiProperty`; feature module
with controller/service/dto; class-validator DTOs; `@InjectModel`; register models in `forFeature`
and `app.module.ts`; mirror existing `.spec.ts` style.
</conventions>

<requirements>
Think carefully about the slot-generation logic and consider edge cases before coding.

1. Booking model:
   - Fields: `id`, `clientId` (FK User — who books), `organizationId`, `serviceId`, `masterId`
     (FK User — the staff member), `startTime` (DATE/timestamp), `endTime` (DATE — derived from
     service durationMinutes), `status` (ENUM: 'pending' | 'confirmed' | 'completed' | 'cancelled',
     default 'pending'), optional `comment`.
   - Associations to User (client), User (master), Organization, Service.
2. Available-slots endpoint:
   - `GET /bookings/available?masterId=&serviceId=&date=YYYY-MM-DD`
   - Logic: find the master's working hours for that date's dayOfWeek; verify the master provides
     the requested service (StaffService); walk from startTime to endTime in steps of the service's
     durationMinutes; exclude any slot overlapping an existing non-cancelled booking for that master;
     return the list of free start times.
3. Booking endpoints:
   - `POST /bookings` — create a booking for a given slot. Validate the slot is actually available
     (re-run the overlap check server-side; never trust the client) and that the master provides the
     service. Set endTime = startTime + durationMinutes, status = 'pending'.
   - `PATCH /bookings/:id/status` — transition status. Enforce the lifecycle:
     pending→confirmed, pending→cancelled, confirmed→completed, confirmed→cancelled. Reject illegal
     transitions with a 400/409 and a clear message.
   - `GET /bookings/:id` — one booking.
   - `GET /bookings?clientId=` and `GET /bookings?masterId=` — list bookings for a client or master.
4. Keep access control minimal (`// TODO: guard` markers where client/owner checks belong).
</requirements>

<implementation>
- Double-booking is the critical correctness concern: a slot is taken if `[start,end)` overlaps any
  existing booking for that master whose status is not 'cancelled'. Implement one shared overlap
  helper and use it for BOTH availability listing and create-booking validation, so they cannot
  disagree. Explain the overlap condition in a comment.
- Reject creating bookings in the past.
- Treat times consistently; document the timezone assumption (store UTC, compare against the
  master's "HH:mm" working hours for that calendar date).
- Do NOT pre-generate or persist slots — compute them on demand. No payments, no notifications.
</implementation>

<output>
Create/modify (relative paths):
- `./src/bookings/booking.model.ts`
- `./src/bookings/dto/create-booking.dto.ts`
- `./src/bookings/dto/update-booking-status.dto.ts`
- `./src/bookings/dto/available-slots.query.dto.ts`
- `./src/bookings/bookings.service.ts`   (include the shared overlap + slot-generation helpers)
- `./src/bookings/bookings.controller.ts`
- `./src/bookings/bookings.module.ts`
- `./src/bookings/bookings.service.spec.ts` (cover slot generation + illegal status transition + double-booking rejection)
- update `./src/app.module.ts` (register Booking model + import BookingsModule)
</output>

<verification>
- `npm run build` compiles cleanly; `npm run lint` clean for changed files.
- Run `npm test` — the bookings spec must pass, including: a generated-slots case, a rejected
  overlapping booking, and a rejected illegal status transition.
- Manually reason through one example: a master working 09:00–12:00 with a 60-min service yields
  slots 09:00, 10:00, 11:00, and booking 10:00 removes 10:00 from the next availability response.
</verification>

<success_criteria>
- Clients can list real available slots and book one; double-booking is impossible.
- Status transitions follow the defined lifecycle and reject illegal moves.
- Tests pass; project builds and lints; conventions match the codebase.
</success_criteria>
