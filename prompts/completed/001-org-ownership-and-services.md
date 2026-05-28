<objective>
Extend the existing NestJS booking backend by (1) giving each Organization an owner, and
(2) adding a Services catalog so an organization can list the services it offers.
This is the foundation of the booking flow: clients will later book a specific service,
with a specific staff member, in a generated time slot. The end goal is a clean, credible
backend for a diploma project ("Система для онлайн-записи клиентов в сфере услуг") — keep it
simple and idiomatic, but complete enough to look professional.
</objective>

<context>
- Tech stack: NestJS 11, sequelize-typescript + PostgreSQL, class-validator/class-transformer,
  @nestjs/swagger, JWT auth via passport (already implemented).
- This is a backend-only project for now; an Electron + React frontend comes later.
- Already implemented: User, Role (many-to-many via UserRoles), Auth (JWT + local), and a
  basic Organization (name, email, phone, rating).
- There is NO CLAUDE.md. Infer conventions directly from existing code before writing anything.

Examine these files to match conventions exactly:
@src/organization/organization.model.ts
@src/organization/organization.controller.ts
@src/organization/organization.service.ts
@src/organization/organization.module.ts
@src/organization/dto/create-organization.dto.ts
@src/users/users/users.model.ts
@src/app.module.ts
</context>

<conventions>
Follow the patterns already in the repo — do not introduce new styles:
- Models: `sequelize-typescript` decorators, `declare` fields, `@ApiProperty` on exposed columns,
  a `*CreationAttrs` interface as the second `Model<>` generic.
- Each feature is a module with `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs under `dto/`.
- Services inject the model via `@InjectModel(X) private xRepository: typeof X`.
- DTOs use `class-validator` decorators and `@ApiProperty`.
- Register every new model in BOTH the feature module (`SequelizeModule.forFeature([...])`)
  and in `app.module.ts`'s `models: [...]` array.
- Mirror the existing `.spec.ts` test style (organization.service.spec.ts / .controller.spec.ts).
</conventions>

<requirements>
1. Organization ownership:
   - Add `ownerId` (integer, foreign key to User, nullable) to the Organization model.
   - Add the Sequelize association (Organization `@BelongsTo` User; optionally User `@HasMany` Organization).
   - Accept `ownerId` in CreateOrganizationDto (optional).
2. Services catalog (new `src/services` module — singular file naming like other modules):
   - Service model fields: `id`, `organizationId` (FK to Organization, required),
     `name` (required), `description` (optional), `price` (DECIMAL/DOUBLE, required),
     `durationMinutes` (integer, required — used later to generate booking slots),
     `isActive` (boolean, default true).
   - Associations: Organization `@HasMany(() => Service)`, Service `@BelongsTo(() => Organization)`.
   - CreateServiceDto + UpdateServiceDto with class-validator rules (e.g. price > 0, duration > 0).
   - Endpoints on a `services` controller:
     - `POST /services` — create a service
     - `GET /organization/:id/services` OR `GET /services?organizationId=` — list an org's services
     - `GET /services/:id` — one service
     - `PATCH /services/:id` — update
     - `DELETE /services/:id` — soft-delete by setting isActive=false (explain why in a comment)
3. Keep access control minimal for now (no new guards required) — but leave a clear `// TODO: guard`
   comment where owner-only access should eventually be enforced.
</requirements>

<implementation>
- `durationMinutes` matters because a later prompt generates bookable time slots from it; make sure
  it is a positive integer and documented as such.
- Use soft-delete (isActive=false) for services instead of hard delete, because past bookings will
  reference services and we must not orphan historical data.
- Do not over-engineer: no pagination, no caching, no extra abstractions beyond the existing pattern.
</implementation>

<output>
Create/modify (relative paths):
- `./src/organization/organization.model.ts` — add ownerId + association
- `./src/organization/dto/create-organization.dto.ts` — optional ownerId
- `./src/services/service.model.ts`
- `./src/services/dto/create-service.dto.ts`
- `./src/services/dto/update-service.dto.ts`
- `./src/services/services.service.ts`
- `./src/services/services.controller.ts`
- `./src/services/services.module.ts`
- `./src/services/services.service.spec.ts` (basic spec mirroring existing ones)
- `./src/app.module.ts` — register Service model + import ServicesModule
</output>

<verification>
Before declaring complete:
- Run `npm run build` and confirm it compiles with no TypeScript errors.
- Run `npm run lint` and fix issues introduced by your changes.
- Confirm the new model appears in `app.module.ts` `models: [...]` and in the module's `forFeature`.
- Sanity-check that associations resolve (no circular import crashes) by reasoning through imports.
</verification>

<success_criteria>
- Organizations have an owner and a one-to-many relationship to Services.
- All Services endpoints exist, validate input, and follow the repo's module pattern.
- Project builds and lints cleanly; conventions match existing code.
</success_criteria>
