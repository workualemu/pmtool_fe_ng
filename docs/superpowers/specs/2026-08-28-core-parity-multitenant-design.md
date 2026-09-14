# Core Parity Multi-Tenant Redesign

## Purpose

Redesign the Angular and Spring Boot project-management application to provide the core behavior and look and feel of the finished Laravel toolkit at `C:\workspace_eca\census_pm`. The new application is a cloud-hosted, multi-client product in which one global user may belong to multiple client organizations and each client may own multiple projects.

The Laravel product is the behavioral and visual reference. Its framework-specific implementation is not a constraint. The current Spring schema and APIs may be replaced, and the redesigned application will start with a fresh database.

## Core Release Scope

The core release includes:

- Global identities, client memberships, invitations, and tenant switching.
- Fixed client roles and customizable project roles and permissions.
- Projects and project membership.
- A fixed Project -> Phase -> Activity -> Task hierarchy.
- Project statuses, task statuses, priorities, and tags.
- Task list and task detail drawer.
- Kanban and My Work.
- Dependencies, Gantt, and project milestones.
- Reusable client teams and project assignments.
- Project documents, task attachments, task comments, mentions, and notifications.
- Auditability, tenant isolation, responsive behavior, and light/dark themes.

The initial release excludes custom fields, automations, configurable hierarchy levels, time tracking, integrations, custom dashboards, advanced reports, and general-purpose communications. These exclusions preserve the Laravel product's simplicity-first direction.

## Delivery Strategy

Use a tenant-foundation-first vertical-slice strategy. Every slice includes database migrations, Spring domain and API work, Angular UI, authorization, automated tests, and comparison with the Laravel reference. Do not construct the entire backend before obtaining UI feedback, and do not attempt a full-parity big-bang release.

The delivery order is:

1. Multi-tenant identity, memberships, invitations, authorization, audit foundation, and Angular shell/design system.
2. Projects, project membership, and the project workspace.
3. Phase, activity, and task hierarchy plus project task settings and the task drawer.
4. Task list, Kanban, My Work, filters, and bulk operations.
5. Dependencies, Gantt, milestones, and schedule validation.
6. Reusable client teams and project grants.
7. Documents, task attachments, task comments, mentions, and notifications.
8. Accessibility, performance, security review, observability, backup/restore, and deployment hardening.

Incomplete slices remain out of standard navigation behind feature flags but may be deployed to staging for review.

## System Architecture

Use a modular Spring Boot monolith backed by PostgreSQL and an Angular single-page application. The bounded Spring modules are:

- **Identity:** global users, authentication, and credential recovery.
- **Tenancy:** clients, memberships, invitations, and active-client selection.
- **Authorization:** fixed client roles, custom project roles, and permissions.
- **Projects:** projects, project membership, settings, and archival.
- **Work management:** phases, activities, tasks, statuses, priorities, and tags.
- **Planning:** Kanban ordering, dependencies, Gantt projections, and milestones.
- **Teams:** reusable client teams and project assignments.
- **Collaboration:** documents, attachments, comments, mentions, and notifications.
- **Audit:** elevated access and business-change history.

Module interfaces must be explicit enough to isolate domain rules without introducing distributed services. Cross-module changes that require consistency remain ordinary database transactions.

The Angular application mirrors these feature boundaries with lazy-loaded routes, domain-specific API clients, and feature stores built with Angular signals and RxJS. Authentication, active client, current project, theme, and notifications are shared application state. A global state library is not required initially.

## Tenant Model and Isolation

Use one PostgreSQL database and one shared schema. Every tenant-owned record includes `client_id`, even when ownership could be inferred through a project. The duplication is deliberate: it supports direct filtering, indexing, audit interpretation, and database-enforced cross-client constraints.

A request proceeds through these checks:

1. Authenticate the global user.
2. Resolve the explicitly selected client.
3. Verify active client membership.
4. Validate that the client path parameter, authenticated context, and resource ownership agree.
5. Check client role and project permissions in the service layer.
6. Execute a repository query that requires `client_id`.

Application services must not use unrestricted lookup methods such as a generic `findById` for tenant-owned records. Background jobs carry an explicit client ID, cache keys and object-storage paths are tenant-prefixed, and database constraints prevent cross-client links.

Platform administrators do not receive an invisible tenant-filter bypass. They explicitly enter a tenant context, and every elevated access event is audited.

## Identity and Authorization Model

`users` stores a global identity with a unique normalized email. `clients` stores organization identity, branding, lifecycle status, and subscription-ready metadata. `client_memberships` associates users and clients with a fixed role and membership state. Initial client roles are `CLIENT_ADMIN`, `MEMBER`, and `GUEST`. `client_invitations` contains client-scoped, expiring, single-use invitations. Restricted `platform_roles` represent operational access outside ordinary client membership.

Project authorization uses:

- Client-scoped reusable `project_roles`.
- An application-defined `project_permissions` catalog.
- `project_role_permissions` for configurable permission sets.
- `project_memberships` for direct user grants.
- `teams`, `team_memberships`, and `project_teams` for reusable group grants.

A project-team assignment specifies the project role granted to members of that team. Effective project access is the union of permissions received from direct and team grants. Revocation must be immediate after membership changes. Angular may hide unavailable actions using server-returned capabilities, but Spring remains authoritative.

## Project and Work Model

`projects` includes `client_id`, a client-unique code, title, description, owner membership, dates, budget, health, lifecycle status, archive state, and optimistic-lock version. Projects are archived by normal users. Permanent purge is a separately authorized administrative operation.

Following the Laravel single-hierarchy model, `work_items` represents phases, activities, and tasks. A required type is one of `PHASE`, `ACTIVITY`, or `TASK`. Each work item contains `client_id`, `project_id`, optional `parent_id`, title, description, owner or assignee, dates, progress, sequence, status, priority, planned effort, version, and audit metadata.

Validation enforces the fixed hierarchy:

- A phase has no parent.
- An activity has a phase parent in the same client and project.
- A task has an activity parent in the same client and project.
- Task-only fields are populated only for tasks.

The API may expose business-oriented phase, activity, and task resources while the persistence model remains unified. This keeps hierarchy traversal, ordering, schedule calculations, Gantt projection, and Laravel parity coherent.

`work_item_dependencies` stores validated same-client, same-project dependencies and rejects cycles. Project-scoped tag definitions connect through `work_item_tags`. Project-scoped statuses and priorities preserve the Laravel configuration behavior.

## Milestones

A milestone is a project-level dated marker, not a hierarchy container. `milestones` contains `client_id`, project, creator, optional owner, title, description, target date, status, completion date, version, and audit metadata.

`milestone_work_items` optionally links a milestone to multiple activities and tasks in the same client and project. Milestone state is manually controlled in the core release. Linked work provides context but does not automatically complete the milestone. Milestones appear in a dedicated list and as markers in the Gantt view.

## Teams and Collaboration

Teams belong to a client and can be assigned to multiple projects. A client member may belong to multiple teams. Projects accept both direct member assignments and team assignments.

Collaboration in the core release consists of:

- A project document library with metadata in PostgreSQL and binary content in cloud object storage.
- Optional many-to-many links between project documents and tasks.
- Threaded comments and attachments on tasks.
- User mentions in task comments.
- Durable notifications for assignments, mentions, comment activity, due dates, and milestone changes.

File uploads use generated storage keys and a pre-signed upload flow. Downloads are authorized on every request. Upload validation covers size, declared and detected type, and storage metadata, with an integration point for malware scanning.

Short polling with backoff is sufficient for the initial notification inbox. Real-time delivery is deferred until usage demonstrates a need.

## Angular Experience and Visual Parity

Tailwind CSS is the standard application styling system. Do not introduce new Bootstrap-based feature UI; retire existing Bootstrap dependencies as migrated components no longer require them.

Build a small Angular design system corresponding to the Laravel toolkit's established conventions:

- Application shell with collapsible sidebar, top navigation, tenant switcher, project context, profile menu, and notification menu.
- Reusable page, project-search, section, and dialog headers.
- Buttons, action menus, badges, avatars, tables, cards, pagination, and filters.
- Inputs, validation, date controls, people pickers, selectors, and task-description editing.
- Modal, drawer, confirmation, toast, contextual help, loading skeleton, and empty states.
- Shared tokens for brand colors, typography, spacing, radius, shadow, responsive breakpoints, and light/dark themes.

The goal is behavioral and perceptual parity rather than a literal Blade-to-Angular translation. The running Laravel application is the acceptance reference for structure, density, interaction states, responsive behavior, and theming.

Projects open into a consistent workspace. The task list is the structural hierarchy view. Selecting a task opens a right-side drawer without losing list context. Kanban uses the same tasks and project-defined statuses. My Work aggregates assigned tasks across projects accessible in the active client. Gantt consumes the same hierarchy and dependencies instead of maintaining a second planning model.

Routes are feature-oriented and lazy-loaded, for example `/clients/:clientId/projects/:projectId/tasks`. The route client must agree with the authenticated tenant context. Deep links survive refresh and return non-leaking access-denied or not-found responses.

## API and Client Data Flow

Use versioned, explicitly tenant-scoped REST endpoints such as:

```text
/api/v1/clients/{clientId}/projects
/api/v1/clients/{clientId}/projects/{projectId}/work-items
/api/v1/clients/{clientId}/projects/{projectId}/milestones
/api/v1/clients/{clientId}/projects/{projectId}/teams
/api/v1/clients/{clientId}/projects/{projectId}/documents
/api/v1/clients/{clientId}/my-work
```

Controllers validate transport concerns and delegate to application services. JPA entities are never serialized directly. Request and response DTOs protect domain boundaries. Collection endpoints consistently support pagination, sorting, search, and documented filters.

Purpose-built commands handle operations whose semantics are not ordinary CRUD, including:

- Reordering or reparenting a work item.
- Moving a task between Kanban columns.
- Bulk-updating tasks.
- Adding and removing project users or teams.
- Linking work items to milestones.
- Completing and reopening milestones.
- Creating upload authorizations.
- Marking notifications read.

Mutations return the authoritative representation and optimistic-lock version. A stale write returns a conflict response. Angular may optimistically update hierarchy and Kanban moves, but it must restore the prior state and explain failures when the server rejects a mutation.

Use RFC 9457 Problem Details with a stable application error code, trace identifier, field errors, and safe message. Angular maps errors to inline validation, toast messages, or full-page access and not-found states. Stack traces are never returned to users.

## Security

Use short-lived access tokens and rotated refresh tokens in secure HTTP-only cookies. Do not store bearer tokens in browser local storage. Invitation and password-reset tokens are single-use, hashed at rest, and expiring. Apply rate limits to login, invitations, recovery, uploads, and sensitive administration.

Restrict CORS to configured application origins. Sanitize user-authored rich text before rendering. Keep production secrets outside source control. Record client, actor, action, target, request trace, and time for relevant audit events.

Tenant-isolation tests are release blocking. They must try cross-client reads and writes for every tenant-owned resource, including indirect relationships, object downloads, search results, bulk operations, and background jobs.

## Database Evolution and Storage

Create a new database baseline using Flyway. Do not use Hibernate automatic schema generation outside disposable tests. Migrations must run successfully from an empty PostgreSQL database and include tenant-aware indexes, composite unique constraints, and composite foreign keys where needed.

Mutable business entities use optimistic locking. Store timestamps in UTC and present them in the user's selected zone. Use soft archival only where recovery has business value; do not apply generic soft deletion to every join or event table.

Binary files live in cloud object storage. PostgreSQL stores storage keys, metadata, hashes, uploader, client and project ownership, and task links. Object deletion should be resilient and observable so database and storage cleanup can be reconciled after partial failures.

## Testing and Acceptance

Each slice includes:

- Spring unit tests for rules, scheduling, permissions, and transitions.
- Spring integration tests with PostgreSQL/Testcontainers for repositories, migrations, tenant constraints, security, and REST APIs.
- Angular component tests for forms, permissions, states, and interactions.
- Playwright end-to-end journeys against the integrated Angular and Spring stack.

The authorization matrix covers unauthenticated users, wrong-client users, client members without project access, viewers, editors or managers, client administrators, and platform administrators inside an explicit tenant context.

For every workflow, maintain a concise Laravel parity checklist covering visible data and actions, validation, permissions, loading/empty/error/success states, desktop/mobile behavior, dark mode, notifications, and audit effects.

A slice is complete only when:

1. Its API contract is documented.
2. Its migrations succeed from an empty database.
3. Its automated test suite passes.
4. Cross-client isolation tests pass.
5. The workflow has been checked against Laravel.
6. Operationally relevant logging and metrics are present.

## Operational Readiness

The hardening slice includes accessibility review, query and bundle performance, structured logs with trace IDs, health and readiness endpoints, metrics, error aggregation, backup/restore rehearsal, object-storage lifecycle checks, and a security review. Production deployment must support rolling application releases whose database migrations remain compatible during the rollout window.

## Explicit Decisions

- Core operational parity is the first target; full Laravel feature parity is not.
- The new database starts empty; no legacy-data conversion pipeline is required.
- Shared database and shared schema tenancy is used.
- Global users may belong to multiple clients.
- Platform administrators enter an explicit audited tenant context.
- Client roles are fixed; project roles are client-scoped and customizable.
- The hierarchy is fixed to Phase -> Activity -> Task.
- The persistence model uses one typed hierarchical `work_items` table.
- Milestones are manually managed project markers with optional activity/task links.
- Teams are reusable client groups; projects also support direct user assignment.
- Documents are project-level; comments and attachments are task-level in the core release.
- Effective project permissions are the union of direct and team grants.
- The backend is a modular monolith.
- Tailwind is the Angular styling standard.
- Notifications initially use short polling.
