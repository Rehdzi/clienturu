<objective>
Add reviews (отзывы) so clients can rate an organization after a booking, and make the
Organization's existing `rating` field reflect the average of its reviews. This closes the
booking loop and gives the diploma project a complete, believable feature set. Keep it simple.
</objective>

<context>
- Prerequisites: prompts 001–003 applied. Available: Organization (with a `rating` DOUBLE field
  already defined but unused), Service, Booking (with status lifecycle incl. 'completed'), User.
- The Organization.rating column already exists — this prompt makes it meaningful.
- Match existing conventions; there is no CLAUDE.md.

Examine before writing:
@src/organization/organization.model.ts
@src/organization/organization.service.ts
@src/bookings/booking.model.ts
@src/users/users/users.model.ts
@src/app.module.ts
</context>

<conventions>
Same as prompts 001–003: sequelize-typescript models with `declare` + `@ApiProperty`; feature module
with controller/service/dto; class-validator DTOs; `@InjectModel`; register the model in `forFeature`
and `app.module.ts`; mirror existing `.spec.ts` style.
</conventions>

<requirements>
1. Review model:
   - Fields: `id`, `organizationId` (FK Organization, required), `clientId` (FK User, required),
     `bookingId` (FK Booking, optional — link a review to the visit it came from),
     `rating` (integer 1–5, required), `comment` (string, optional).
   - Associations: Organization `@HasMany(() => Review)`, Review `@BelongsTo` Organization / User / Booking.
2. Endpoints (reviews controller):
   - `POST /reviews` — create a review (validate rating 1–5).
   - `GET /organization/:id/reviews` — list an organization's reviews.
   - `DELETE /reviews/:id` — remove a review.
3. Rating recomputation:
   - After any create/delete, recompute `Organization.rating` as the average of that org's review
     ratings (round to 1 decimal). If there are no reviews, set rating to null/0 (pick one and
     document it). Implement this as a single private helper reused by create and delete so they
     can't diverge.
4. Keep access control minimal (`// TODO: guard` where "only clients with a completed booking may
   review" should eventually be enforced — note this rule in a comment but do not hard-block it now).
</requirements>

<implementation>
- Recompute the average with a DB aggregate (`AVG`) rather than loading all rows into memory, since
  this is the more scalable and defensible approach; explain the choice in a comment.
- Do not add upvotes, replies, or moderation — out of scope.
</implementation>

<output>
Create/modify (relative paths):
- `./src/reviews/review.model.ts`
- `./src/reviews/dto/create-review.dto.ts`
- `./src/reviews/reviews.service.ts`   (include the rating-recompute helper)
- `./src/reviews/reviews.controller.ts`
- `./src/reviews/reviews.module.ts`
- `./src/reviews/reviews.service.spec.ts` (cover rating recomputation on create and delete)
- update `./src/organization/organization.model.ts` (reviews association, if not added earlier)
- update `./src/app.module.ts` (register Review model + import ReviewsModule)
</output>

<verification>
- `npm run build` compiles cleanly; `npm run lint` clean for changed files.
- Run `npm test` — the reviews spec must pass, including a recomputation case (e.g. ratings 4 and 5
  produce org rating 4.5; deleting one updates it).
- Confirm the Review model is registered in app.module.ts `models: [...]` and module `forFeature`.
</verification>

<success_criteria>
- Clients can review organizations; reviews are listable and deletable.
- Organization.rating always equals the rounded average of its reviews.
- Tests pass; project builds and lints; conventions match the codebase.
</success_criteria>
