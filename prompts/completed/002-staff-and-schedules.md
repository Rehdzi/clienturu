<objective>
Add staff (masters) and their working schedules to the NestJS booking backend.
A "master" is an existing User assigned to an organization as staff and able to provide
specific services. Each master has weekly working hours. This is the prerequisite for
generating bookable time slots in the next step. Keep it simple but realistic enough to
defend in a diploma project.
</objective>

<context>
- Prerequisite: prompt 001 must be applied first (Organization has ownerId; Service model exists
  with organizationId and durationMinutes).
- Decision: a master is a User (with a staff role), NOT a separate person entity. Masters are
  linked to an organization through a join table.
- Match existing conventions exactly — there is no CLAUDE.md; infer from code.

Examine before writing:
@src/users/users/users.model.ts
@src/roles/roles.model.ts
@src/roles/user-roles-model.ts
@src/organization/organization.model.ts
@src/services/service.model.ts
@src/app.module.ts
</context>

<conventions>
Same as prompt 001: sequelize-typescript with `declare` fields and `@ApiProperty`; feature module
with controller/service/dto; `@InjectModel`; class-validator DTOs; register new models in the
feature module's `forFeature` AND in `app.module.ts`; mirror existing `.spec.ts` style.
</conventions>

<requirements>
1. Org ↔ staff link (new join model, e.g. `OrganizationStaff`):
   - Fields: `organizationId` (FK Organization), `userId` (FK User). No createdAt/updatedAt
     (follow UserRoles convention).
   - Associations: Organization `@BelongsToMany(() => User, () => OrganizationStaff)` exposed as
     `staff`, and the inverse on User if helpful.
2. Master ↔ services link (which services a master can perform):
   - A join model, e.g. `StaffService` (userId, serviceId), with BelongsToMany associations.
   - Endpoint to assign/unassign services to a master.
3. Working schedule model (`Schedule` or `WorkingHours`):
   - Fields: `id`, `userId` (FK User — the master), `organizationId` (FK Organization),
     `dayOfWeek` (integer 0–6), `startTime` (string "HH:mm"), `endTime` (string "HH:mm").
   - One master can have multiple rows (one per working day).
   - Validation: dayOfWeek 0–6, time strings match HH:mm, endTime after startTime.
4. Endpoints (staff controller + schedule controller, or one `staff` module):
   - `POST /organization/:id/staff` — assign a user as staff of an org (body: userId)
   - `DELETE /organization/:id/staff/:userId` — remove staff
   - `GET /organization/:id/staff` — list an org's masters
   - `POST /staff/:userId/services` — set which services a master provides (body: serviceId[])
   - `POST /staff/:userId/schedule` — create/replace a master's weekly working hours
   - `GET /staff/:userId/schedule` — read a master's schedule
5. Ensure a "Staff"/"Master" role value exists or is created in the roles flow (reuse the existing
   roles mechanism rather than inventing a parallel one). Add a `// TODO: guard` where owner-only
   access should later be enforced.
</requirements>

<implementation>
- Keep schedule storage simple: one row per (master, dayOfWeek). This is enough for the slot
  generator in prompt 003, which will read durationMinutes from the service and the master's
  working hours for the requested day.
- Store times as "HH:mm" strings (not Date) to avoid timezone headaches in a student project;
  document this choice in a comment.
- Do not build recurring-exception/holiday logic — out of scope.
</implementation>

<output>
Create/modify (relative paths):
- `./src/staff/organization-staff.model.ts`
- `./src/staff/staff-service.model.ts`
- `./src/staff/schedule.model.ts`
- `./src/staff/dto/assign-staff.dto.ts`
- `./src/staff/dto/set-staff-services.dto.ts`
- `./src/staff/dto/set-schedule.dto.ts`
- `./src/staff/staff.service.ts`
- `./src/staff/staff.controller.ts`
- `./src/staff/staff.module.ts`
- `./src/staff/staff.service.spec.ts`
- update `./src/organization/organization.model.ts` (staff association)
- update `./src/app.module.ts` (register new models + import StaffModule)
</output>

<verification>
- `npm run build` compiles with no errors.
- `npm run lint` is clean for changed files.
- All new models registered in app.module.ts `models: [...]` and in `forFeature`.
- Reason through associations to confirm no circular-import runtime crash.
</verification>

<success_criteria>
- A User can be assigned as a master to an organization and given a set of services.
- A master has queryable weekly working hours validated for sane values.
- Builds and lints cleanly; matches existing conventions.
</success_criteria>
