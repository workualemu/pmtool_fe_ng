# Multi-Tenant Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a working foundation in which a global user can authenticate, switch among authorized client organizations, accept invitations, and use a tenant-aware Angular shell backed by audited Spring authorization.

**Architecture:** Replace the existing single-client user relationship with global identities and explicit client memberships in a Flyway-managed PostgreSQL schema. Spring Security resolves authentication first and a separate tenant filter validates `X-Client-Id` against each client-scoped URL; Angular stores only the current user and selected tenant while credentials remain in secure HTTP-only cookies.

**Tech Stack:** Java 25, Spring Boot 3.4.5, Spring Security 6, Spring Data JPA, PostgreSQL, Flyway, Testcontainers, JUnit 5, Angular 20, TypeScript 5.8, signals, RxJS 7.8, Tailwind CSS 4, Jasmine/Karma, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-28-core-parity-multitenant-design.md`

## Global Constraints

- Use one PostgreSQL database and one shared schema; every tenant-owned record carries `client_id`.
- A global user may belong to multiple clients, but every tenant-scoped request has exactly one explicit active client.
- Platform administrators enter an explicit audited tenant context; they never bypass tenant filtering invisibly.
- Client roles are fixed to `CLIENT_ADMIN`, `MEMBER`, and `GUEST`; project roles are deferred to the projects slice.
- Authentication credentials remain in secure HTTP-only cookies and are never stored in Angular local storage.
- Use Flyway from an empty database; Hibernate `ddl-auto` is `validate` outside disposable tests.
- Use RFC 9457 Problem Details for API failures and never serialize JPA entities directly.
- Tailwind CSS is the Angular styling standard; do not add Bootstrap-based feature UI.
- Preserve unrelated uncommitted work in both repositories.

## Planned File Structure

The backend repository is `C:\repos\wpm\pmtool_be`; frontend paths are relative to `C:\repos\wpm\pmtool_fe_ng`.

Backend packages introduced by this slice:

- `identity/domain`: global user and platform-role entities.
- `tenancy/domain`: clients, memberships, invitations, and enums.
- `tenancy/application`: membership lookup, tenant selection, invitations, and client administration.
- `security`: authentication principal, cookie token service, tenant context/filter, and access policy.
- `audit`: immutable audit event persistence and recording service.
- `web`: DTOs, controllers, and Problem Details exception mapping.

Frontend feature boundaries introduced by this slice:

- `core/auth`: authenticated-user store, auth API, guard, and bootstrap.
- `core/tenancy`: tenant store, tenant API, selection interceptor, and guard.
- `core/http`: API error model/interceptor.
- `shared/ui`: page header, button, empty state, modal, toast, and loading primitives.
- `layouts/app-shell`: responsive tenant-aware application frame.
- `features/tenant-selection` and `features/invitations`: foundation journeys.

---

### Task 1: Establish the Flyway-managed PostgreSQL test baseline

**Files:**
- Modify: `C:\repos\wpm\pmtool_be\pom.xml`
- Modify: `C:\repos\wpm\pmtool_be\src\main\resources\application.yml`
- Create: `C:\repos\wpm\pmtool_be\src\test\resources\application-test.yml`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\support\PostgresIntegrationTest.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\database\FlywayBaselineIT.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\resources\db\migration\V1__identity_and_tenancy.sql`
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\model\` (legacy single-client entities)
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\repository\` (legacy repositories)
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\service\` (legacy services)
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\payload\` (legacy DTOs)
- Delete: legacy feature controllers under `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\controller\`, retaining only `HelloController.java` until the health endpoint replaces it
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\bootstrap\SystemBootstrapRunner.java`
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\jwt\`
- Delete: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\service\`
- Delete: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\service\ProjectServiceTest.java`

**Interfaces:**
- Consumes: PostgreSQL connection properties from environment variables.
- Produces: `PostgresIntegrationTest`, the base class for database integration tests; schema tables `users`, `platform_user_roles`, `clients`, `client_memberships`, `client_invitations`, `refresh_tokens`, and `audit_events`.

- [ ] **Step 1: Write the failing migration integration test**

```java
package com.wojet.pmtool.database;

import static org.assertj.core.api.Assertions.assertThat;

import com.wojet.pmtool.support.PostgresIntegrationTest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

class FlywayBaselineIT extends PostgresIntegrationTest {
  @Autowired JdbcTemplate jdbc;

  @Test
  void createsTheIdentityAndTenancyTables() {
    List<String> names = jdbc.queryForList(
        "select table_name from information_schema.tables where table_schema = 'public'",
        String.class);
    assertThat(names).contains("users", "clients", "client_memberships",
        "client_invitations", "refresh_tokens", "audit_events");
  }
}
```

- [ ] **Step 2: Run the test to verify the missing Testcontainers/Flyway setup fails**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=FlywayBaselineIT test`

Expected: FAIL because `PostgresIntegrationTest` and the migration do not exist.

- [ ] **Step 3: Add Flyway and Testcontainers dependencies**

Add `org.flywaydb:flyway-core`, `org.flywaydb:flyway-database-postgresql`, `org.testcontainers:postgresql`, and `org.testcontainers:junit-jupiter`. Keep Spring Boot dependency management in control of their versions.

- [ ] **Step 4: Remove the obsolete single-client backend implementation**

Delete the listed legacy entities, repositories, services, DTOs, controllers, bootstrap runner, JWT implementation, security principals, and obsolete service test. Keep the deletions in this baseline commit so Hibernate validates only the redesigned model introduced by this plan. Retain Git history as the recovery mechanism; copy no legacy entity into the new packages. Keep `WebSecurityConfig`, `CorsConfig`, exception infrastructure, application bootstrap, and `HelloController` temporarily, simplifying their imports until the project compiles.

- [ ] **Step 5: Add the shared PostgreSQL integration-test base**

```java
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
public abstract class PostgresIntegrationTest {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17-alpine");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }
}
```

- [ ] **Step 6: Create the initial SQL migration**

Create UUID primary keys, normalized-email uniqueness, client-slug uniqueness, membership uniqueness on `(client_id, user_id)`, invitation-token-hash uniqueness, expiry/status checks, refresh-token hash uniqueness, and indexes on all `client_id` and expiry columns. Use `timestamptz` for instants and include `version bigint not null default 0` on mutable records.

The membership role check is:

```sql
constraint ck_client_membership_role
  check (role in ('CLIENT_ADMIN', 'MEMBER', 'GUEST'))
```

- [ ] **Step 7: Disable Hibernate schema mutation**

Set production/default configuration to:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

Move datasource password, JWT secrets, and bootstrap credentials to required environment-variable substitutions with no production defaults. Configure the test profile with `ddl-auto: validate` and Flyway enabled.

- [ ] **Step 8: Run the migration test**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=FlywayBaselineIT test`

Expected: PASS and Flyway reports migration version `1`.

- [ ] **Step 9: Commit the database baseline**

```powershell
cd C:\repos\wpm\pmtool_be
git add -A pom.xml src/main src/test
git commit -m "build: establish Flyway tenant schema"
```

### Task 2: Map global identity and tenant membership domains

**Files:**
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\identity\domain\User.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\identity\domain\UserRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\Client.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientMembership.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientRole.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\MembershipStatus.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientMembershipRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\tenancy\ClientMembershipRepositoryIT.java`

**Interfaces:**
- Consumes: V1 tables from Task 1.
- Produces: `findActiveByUserId(UUID userId)`, `findActive(UUID clientId, UUID userId)`, and tenant domain entities used by authentication and authorization.

- [ ] **Step 1: Write repository tests for multiple memberships and isolation**

```java
@Test
void oneIdentityCanHaveMembershipsInTwoClients() {
  User user = users.save(User.create("alex@example.org", "hash", "Alex", "Morgan"));
  Client first = clients.save(Client.create("Alpha", "alpha"));
  Client second = clients.save(Client.create("Beta", "beta"));
  memberships.save(ClientMembership.active(first, user, ClientRole.CLIENT_ADMIN));
  memberships.save(ClientMembership.active(second, user, ClientRole.MEMBER));

  assertThat(memberships.findActiveByUserId(user.getId()))
      .extracting(m -> m.getClient().getId())
      .containsExactlyInAnyOrder(first.getId(), second.getId());
}

@Test
void suspendedMembershipIsNotActive() {
  ClientMembership membership = persistedMembership(MembershipStatus.SUSPENDED);
  assertThat(memberships.findActive(
      membership.getClient().getId(), membership.getUser().getId())).isEmpty();
}
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=ClientMembershipRepositoryIT test`

Expected: FAIL because the new domain types do not exist.

- [ ] **Step 3: Implement focused JPA entities and repositories**

Use UUID IDs, `@Version`, package-private no-argument constructors, named factory methods, and no JSON annotations. Normalize email and slug in factory methods. Define:

```java
Optional<ClientMembership> findByClientIdAndUserIdAndStatus(
    UUID clientId, UUID userId, MembershipStatus status);

default Optional<ClientMembership> findActive(UUID clientId, UUID userId) {
  return findByClientIdAndUserIdAndStatus(clientId, userId, MembershipStatus.ACTIVE);
}

@Query("""
  select m from ClientMembership m join fetch m.client
  where m.user.id = :userId and m.status = 'ACTIVE'
  order by m.client.name
  """)
List<ClientMembership> findActiveByUserId(UUID userId);
```

- [ ] **Step 4: Run repository tests**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=ClientMembershipRepositoryIT test`

Expected: PASS.

- [ ] **Step 5: Commit the domain mapping**

```powershell
cd C:\repos\wpm\pmtool_be
git add src/main/java/com/wojet/pmtool/identity src/main/java/com/wojet/pmtool/tenancy/domain src/test/java/com/wojet/pmtool/tenancy/ClientMembershipRepositoryIT.java
git commit -m "feat: model global users and client memberships"
```

### Task 3: Replace authentication with short-lived access and rotated refresh cookies

**Files:**
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\AuthenticatedUser.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\AccessTokenService.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\RefreshToken.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\RefreshTokenRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\RefreshTokenService.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\auth\AuthenticationController.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\auth\AuthenticationDtos.java`
- Modify: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\WebSecurityConfig.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\AccessTokenFilter.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\web\auth\AuthenticationControllerIT.java`

**Interfaces:**
- Consumes: `UserRepository`, `ClientMembershipRepository`.
- Produces: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`; `AuthenticatedUser(UUID userId, String email, Set<String> platformRoles)`.

- [ ] **Step 1: Write the authentication lifecycle integration test**

```java
@Test
void loginRefreshAndLogoutRotateHttpOnlyCookies() throws Exception {
  seedUser("alex@example.org", "correct horse");

  MvcResult login = mvc.perform(post("/api/v1/auth/login")
      .contentType(APPLICATION_JSON)
      .content("""{"email":"alex@example.org","password":"correct horse"}"""))
      .andExpect(status().isOk())
      .andExpect(cookie().httpOnly("pm_access", true))
      .andExpect(cookie().httpOnly("pm_refresh", true))
      .andExpect(jsonPath("$.email").value("alex@example.org"))
      .andReturn();

  Cookie refresh = login.getResponse().getCookie("pm_refresh");
  mvc.perform(post("/api/v1/auth/refresh").cookie(refresh))
      .andExpect(status().isOk())
      .andExpect(cookie().value("pm_refresh", not(refresh.getValue())));

  mvc.perform(post("/api/v1/auth/logout").cookie(refresh))
      .andExpect(status().isNoContent())
      .andExpect(cookie().maxAge("pm_access", 0))
      .andExpect(cookie().maxAge("pm_refresh", 0));
}
```

- [ ] **Step 2: Run the test and verify old endpoints/cookies fail**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=AuthenticationControllerIT test`

Expected: FAIL because `/api/v1/auth/*` and `pm_refresh` do not exist.

- [ ] **Step 3: Implement authentication services**

Set access lifetime to 15 minutes and refresh lifetime to 14 days through configuration. Hash refresh tokens with SHA-256 before persistence. On refresh, revoke the presented record and create a replacement in one transaction. On logout, revoke the presented refresh token and expire both cookies.

`GET /me` returns only transport DTOs:

```java
public record CurrentUserResponse(
    UUID id,
    String email,
    String firstName,
    String lastName,
    Set<String> platformRoles,
    List<ClientSummary> clients) {}

public record ClientSummary(UUID id, String name, String slug, String role) {}
```

- [ ] **Step 4: Configure secure cookies and CSRF boundary**

Use `HttpOnly`, `SameSite=Lax`, path `/`, configurable `Secure`, and distinct cookie names. Keep state-changing endpoints protected by an origin check and a double-submit CSRF header/cookie pair; permit only login, refresh, invitation inspection, and health endpoints without authentication.

- [ ] **Step 5: Run authentication and security tests**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=AuthenticationControllerIT test`

Expected: PASS, including invalid credentials, expired refresh, replayed refresh, and unauthenticated `/me` cases.

- [ ] **Step 6: Commit authentication replacement**

```powershell
cd C:\repos\wpm\pmtool_be
git add src/main/java/com/wojet/pmtool/security src/main/java/com/wojet/pmtool/web/auth src/test/java/com/wojet/pmtool/web/auth/AuthenticationControllerIT.java
git commit -m "feat: add rotated cookie authentication"
```

### Task 4: Enforce explicit tenant context on every client-scoped request

**Files:**
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\tenant\TenantContext.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\tenant\TenantContextHolder.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\tenant\TenantContextFilter.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\tenant\ClientAccessPolicy.java`
- Modify: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\security\WebSecurityConfig.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\client\ClientContextController.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\security\tenant\TenantContextFilterIT.java`

**Interfaces:**
- Consumes: authenticated principal and `ClientMembershipRepository.findActive(clientId, userId)`.
- Produces: request-scoped `TenantContext(UUID clientId, UUID membershipId, ClientRole role, boolean elevated)` and `GET /api/v1/clients/{clientId}/context`.

- [ ] **Step 1: Write the cross-client filter tests**

```java
@Test
void rejectsAClientPathWithoutMatchingHeader() throws Exception {
  mvc.perform(get("/api/v1/clients/{id}/context", alphaId)
      .cookie(accessCookie(userInAlpha))
      .header("X-Client-Id", betaId))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.code").value("TENANT_CONTEXT_MISMATCH"));
}

@Test
void rejectsAUserWithoutActiveMembership() throws Exception {
  mvc.perform(get("/api/v1/clients/{id}/context", betaId)
      .cookie(accessCookie(userInAlpha))
      .header("X-Client-Id", betaId))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.code").value("CLIENT_ACCESS_DENIED"));
}
```

- [ ] **Step 2: Run the filter test and verify it fails**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=TenantContextFilterIT test`

Expected: FAIL because the context endpoint/filter does not exist.

- [ ] **Step 3: Implement tenant resolution and cleanup**

Match `/api/v1/clients/{clientId}/**`, parse the UUID path segment and `X-Client-Id`, require equality, validate active membership, install `TenantContext`, and clear the holder in `finally`. The holder API is:

```java
public interface TenantContextHolder {
  TenantContext require();
  void set(TenantContext context);
  void clear();
}
```

Return Problem Details codes `TENANT_CONTEXT_REQUIRED`, `TENANT_CONTEXT_MISMATCH`, and `CLIENT_ACCESS_DENIED` without revealing client metadata.

- [ ] **Step 4: Add a minimal context endpoint**

Return `{clientId, clientName, membershipId, role, elevated}` from the resolved context. This endpoint becomes the smoke test for later tenant-scoped modules.

- [ ] **Step 5: Run tenant tests**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=TenantContextFilterIT test`

Expected: PASS for matching active membership and expected 400/403 responses for mismatch, missing header, suspended membership, and wrong client.

- [ ] **Step 6: Commit tenant enforcement**

```powershell
cd C:\repos\wpm\pmtool_be
git add src/main/java/com/wojet/pmtool/security/tenant src/main/java/com/wojet/pmtool/web/client src/main/java/com/wojet/pmtool/security/WebSecurityConfig.java src/test/java/com/wojet/pmtool/security/tenant/TenantContextFilterIT.java
git commit -m "feat: enforce explicit tenant context"
```

### Task 5: Add client administration and invitation acceptance

**Files:**
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientInvitation.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\InvitationStatus.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\domain\ClientInvitationRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\application\ClientAdministrationService.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\tenancy\application\InvitationService.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\client\ClientAdministrationController.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\invitation\InvitationController.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\web\invitation\InvitationFlowIT.java`

**Interfaces:**
- Consumes: tenant context, `PasswordEncoder`, global users, and memberships.
- Produces: client-member list, invitation create/revoke/inspect/accept endpoints; one-time raw token returned only to the mail adapter.

- [ ] **Step 1: Write invitation lifecycle tests**

```java
@Test
void existingGlobalUserAcceptsInvitationAndGainsMembership() throws Exception {
  String token = invite(alphaAdmin, "consultant@example.org", ClientRole.MEMBER);

  mvc.perform(post("/api/v1/invitations/{token}/accept", token)
      .cookie(accessCookie(consultant)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.clientId").value(alphaId.toString()))
      .andExpect(jsonPath("$.role").value("MEMBER"));

  assertThat(memberships.findActive(alphaId, consultant.id())).isPresent();
  assertThat(invitationByToken(token).getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
}

@Test
void tokenCannotBeAcceptedTwice() {
  String token = acceptedInvitation();
  assertThatThrownBy(() -> invitations.accept(token, authenticatedUser))
      .isInstanceOf(InvitationUnavailableException.class);
}
```

- [ ] **Step 2: Run invitation tests and verify failure**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=InvitationFlowIT test`

Expected: FAIL because invitation services/endpoints do not exist.

- [ ] **Step 3: Implement invitation token safety and transactions**

Generate 32 random bytes, return a base64url raw token once, store only SHA-256, expire after 72 hours, and bind the invitation to normalized email, client, role, inviter, and status. Accept in one transaction after locking the invitation row. Reject expired, revoked, accepted, wrong-email, and suspended-client cases with stable error codes.

- [ ] **Step 4: Implement client administration endpoints**

Expose:

```text
GET    /api/v1/clients/{clientId}/members
POST   /api/v1/clients/{clientId}/invitations
GET    /api/v1/clients/{clientId}/invitations
DELETE /api/v1/clients/{clientId}/invitations/{invitationId}
GET    /api/v1/invitations/{token}
POST   /api/v1/invitations/{token}/accept
```

Require `CLIENT_ADMIN` for client-scoped invitation management. Public token inspection returns client display name, masked invited email, role, and expiry but no membership/user identifiers.

- [ ] **Step 5: Run invitation and tenant tests**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=InvitationFlowIT,TenantContextFilterIT test`

Expected: PASS, including wrong-client administration attempts.

- [ ] **Step 6: Commit invitations and membership administration**

```powershell
cd C:\repos\wpm\pmtool_be
git add src/main/java/com/wojet/pmtool/tenancy src/main/java/com/wojet/pmtool/web/client src/main/java/com/wojet/pmtool/web/invitation src/test/java/com/wojet/pmtool/web/invitation/InvitationFlowIT.java
git commit -m "feat: add tenant invitations and membership admin"
```

### Task 6: Add Problem Details and immutable audit events

**Files:**
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\error\ApiExceptionHandler.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\web\error\DomainProblem.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\audit\AuditEvent.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\audit\AuditEventRepository.java`
- Create: `C:\repos\wpm\pmtool_be\src\main\java\com\wojet\pmtool\audit\AuditService.java`
- Create: `C:\repos\wpm\pmtool_be\src\test\java\com\wojet\pmtool\audit\AuditAndProblemDetailsIT.java`

**Interfaces:**
- Consumes: authenticated user, optional tenant context, request trace ID.
- Produces: `AuditService.record(AuditCommand command)` and consistent `application/problem+json` failures.

- [ ] **Step 1: Write error and audit tests**

```java
@Test
void validationFailureUsesProblemDetails() throws Exception {
  mvc.perform(post("/api/v1/auth/login")
      .contentType(APPLICATION_JSON).content("{}"))
      .andExpect(status().isBadRequest())
      .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
      .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
      .andExpect(jsonPath("$.traceId").isNotEmpty())
      .andExpect(jsonPath("$.fieldErrors.email").exists());
}

@Test
void tenantSwitchWritesElevatedAuditContext() {
  audit.record(new AuditCommand(alphaId, platformAdminId, "TENANT_CONTEXT_ENTERED",
      "CLIENT", alphaId, true, Map.of()));
  assertThat(events.findByClientIdOrderByOccurredAtDesc(alphaId).getFirst().isElevated())
      .isTrue();
}
```

- [ ] **Step 2: Run tests and verify inconsistent legacy errors fail**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd -Dtest=AuditAndProblemDetailsIT test`

Expected: FAIL because Problem Details fields and audit services do not exist.

- [ ] **Step 3: Implement stable error translation**

Map validation, authentication, access, missing resource, conflict, and domain errors to 400, 401, 403, 404, 409, and 422 respectively. Always include `type`, `title`, `status`, `code`, `traceId`, and `instance`; include `fieldErrors` only for invalid fields.

- [ ] **Step 4: Implement append-only audit recording**

Define:

```java
public record AuditCommand(
    UUID clientId,
    UUID actorId,
    String action,
    String artifactType,
    UUID artifactId,
    boolean elevated,
    Map<String, Object> changes) {}
```

Record login success/failure, refresh-token replay, tenant-context entry, invitation create/revoke/accept, membership role/status changes, and client updates. Do not audit token values, passwords, or full request payloads.

- [ ] **Step 5: Run the complete backend foundation suite**

Run: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd test`

Expected: PASS with no Hibernate schema mutation and no Spring context failure.

- [ ] **Step 6: Commit errors and audit foundation**

```powershell
cd C:\repos\wpm\pmtool_be
git add src/main/java/com/wojet/pmtool/web/error src/main/java/com/wojet/pmtool/audit src/test/java/com/wojet/pmtool/audit/AuditAndProblemDetailsIT.java
git commit -m "feat: add API problems and tenant audit events"
```

### Task 7: Build Angular authentication and tenant state

**Files:**
- Create: `src/app/core/auth/auth.models.ts`
- Create: `src/app/core/auth/auth.api.ts`
- Create: `src/app/core/auth/auth.store.ts`
- Create: `src/app/core/auth/auth.guard.ts`
- Create: `src/app/core/tenancy/tenant.models.ts`
- Create: `src/app/core/tenancy/tenant.store.ts`
- Create: `src/app/core/tenancy/tenant.interceptor.ts`
- Create: `src/app/core/http/api-problem.ts`
- Create: `src/app/core/http/api-error.interceptor.ts`
- Modify: `src/app/app.config.ts`
- Modify: `src/app/auth/login/login.component.ts`
- Test: `src/app/core/auth/auth.store.spec.ts`
- Test: `src/app/core/tenancy/tenant.store.spec.ts`
- Test: `src/app/core/tenancy/tenant.interceptor.spec.ts`

**Interfaces:**
- Consumes: backend `/api/v1/auth/*` and client context endpoints.
- Produces: `AuthStore.user`, `AuthStore.status`, `AuthStore.bootstrap()`, `TenantStore.active`, `TenantStore.select(clientId)`, and an interceptor that sends `X-Client-Id` only to matching client-scoped API URLs.

- [ ] **Step 1: Write failing store tests**

```typescript
it('bootstraps user and selects the sole client', () => {
  api.me.and.returnValue(of(userWithClients([alpha])));
  store.bootstrap();
  expect(store.user()?.email).toBe('alex@example.org');
  expect(tenantStore.active()?.id).toBe(alpha.id);
});

it('does not send a tenant header to authentication endpoints', () => {
  tenantStore.select(alpha.id);
  http.get('/api/v1/auth/me').subscribe();
  const request = httpMock.expectOne('/api/v1/auth/me');
  expect(request.request.headers.has('X-Client-Id')).toBeFalse();
});
```

- [ ] **Step 2: Run the focused Angular tests**

Run: `npm test -- --watch=false --include src/app/core/auth/auth.store.spec.ts --include src/app/core/tenancy/tenant.store.spec.ts --include src/app/core/tenancy/tenant.interceptor.spec.ts`

Expected: FAIL because the new stores and interceptors do not exist.

- [ ] **Step 3: Implement typed auth and tenant stores**

Use these public models:

```typescript
export interface ClientSummary {
  id: string;
  name: string;
  slug: string;
  role: 'CLIENT_ADMIN' | 'MEMBER' | 'GUEST';
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  platformRoles: string[];
  clients: ClientSummary[];
}
```

`AuthStore.bootstrap()` calls `/auth/me`, treats 401 as anonymous, and never reads or writes tokens. `TenantStore.select()` accepts only a client in `AuthStore.user().clients`, persists the selected non-secret client UUID in local storage under `pm.activeClient`, and falls back to the sole/first authorized client when the stored value is stale.

- [ ] **Step 4: Implement HTTP error and tenant interceptors**

The tenant interceptor parses `/api/v1/clients/{uuid}/` and adds `X-Client-Id` only when the URL client equals `TenantStore.active().id`; otherwise it throws a client-side `TENANT_ROUTE_MISMATCH` before sending the request. The error interceptor maps Problem Details without discarding `code`, `traceId`, or `fieldErrors`.

- [ ] **Step 5: Update login and application providers**

Register interceptors in order: credentials/CSRF, tenant context, API errors. Update login to submit `{email, password}`, set the current user from the response, and route one-client users into the shell and multi-client users to tenant selection.

- [ ] **Step 6: Run Angular state tests**

Run: `npm test -- --watch=false --include src/app/core/auth/auth.store.spec.ts --include src/app/core/tenancy/tenant.store.spec.ts --include src/app/core/tenancy/tenant.interceptor.spec.ts`

Expected: PASS.

- [ ] **Step 7: Commit auth and tenant state**

```powershell
git add src/app/core src/app/app.config.ts src/app/auth/login
git commit -m "feat: add Angular tenant-aware auth state"
```

### Task 8: Create the Tailwind design-system primitives

**Files:**
- Modify: `src/styles.css`
- Create: `src/app/shared/ui/page-header/page-header.component.ts`
- Create: `src/app/shared/ui/page-header/page-header.component.html`
- Create: `src/app/shared/ui/button/button.component.ts`
- Create: `src/app/shared/ui/empty-state/empty-state.component.ts`
- Create: `src/app/shared/ui/loading-state/loading-state.component.ts`
- Create: `src/app/shared/ui/toast/toast.service.ts`
- Create: `src/app/shared/ui/toast/toast-outlet.component.ts`
- Create: `src/app/shared/ui/confirm/confirm-dialog.service.ts`
- Create: `src/app/shared/ui/confirm/confirm-dialog.component.ts`
- Test: `src/app/shared/ui/page-header/page-header.component.spec.ts`
- Test: `src/app/shared/ui/button/button.component.spec.ts`
- Test: `src/app/shared/ui/confirm/confirm-dialog.component.spec.ts`

**Interfaces:**
- Consumes: Laravel heading, action, confirmation, empty-state, and theme conventions.
- Produces: reusable standalone Angular components and CSS design tokens for later slices.

- [ ] **Step 1: Write component contract tests**

```typescript
it('renders one semantic page heading and projected actions', () => {
  fixture.componentRef.setInput('title', 'Projects');
  fixture.componentRef.setInput('subtitle', 'Plan and deliver client work');
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
  expect(fixture.nativeElement.textContent).toContain('Projects');
});

it('requires explicit confirmation before resolving destructive action', () => {
  const result = service.open({title: 'Delete team?', confirmLabel: 'Delete', tone: 'danger'});
  component.cancel();
  expectAsync(firstValueFrom(result)).toBeResolvedTo(false);
});
```

- [ ] **Step 2: Run primitive tests and verify failure**

Run: `npm test -- --watch=false --include src/app/shared/ui/**/*.spec.ts`

Expected: FAIL because the primitives do not exist.

- [ ] **Step 3: Define global Tailwind tokens**

In `src/styles.css`, define light/dark CSS custom properties for brand, canvas, surface, border, text, muted text, danger, success, warning, radii, shadows, and focus ring. Apply a consistent `font-family`, canvas background, text color, and visible `:focus-visible` outline. Use Tailwind utilities in component templates; keep component CSS limited to behavior Tailwind cannot express clearly.

- [ ] **Step 4: Implement accessible standalone primitives**

The page header emits one `h1`; buttons use native button semantics; empty/loading states expose status text; toasts use an `aria-live` region; confirmation traps focus, supports Escape, restores focus, and never calls `window.confirm`.

- [ ] **Step 5: Run tests and a production build**

Run: `npm test -- --watch=false --include src/app/shared/ui/**/*.spec.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS within Angular bundle and component-style budgets.

- [ ] **Step 6: Commit the design-system foundation**

```powershell
git add src/styles.css src/app/shared/ui
git commit -m "feat: add application design primitives"
```

### Task 9: Replace eager routes with a tenant-aware responsive shell

**Files:**
- Create: `src/app/layouts/app-shell/app-shell.component.ts`
- Create: `src/app/layouts/app-shell/app-shell.component.html`
- Create: `src/app/layouts/app-shell/app-shell.component.css`
- Create: `src/app/layouts/app-shell/app-shell.routes.ts`
- Create: `src/app/layouts/app-shell/sidebar-navigation.ts`
- Create: `src/app/features/tenant-selection/tenant-selection.component.ts`
- Create: `src/app/features/tenant-selection/tenant-selection.component.html`
- Create: `src/app/features/home/home.component.ts`
- Create: `src/app/features/home/home.component.html`
- Modify: `src/app/app.routes.ts`
- Test: `src/app/layouts/app-shell/app-shell.component.spec.ts`
- Test: `src/app/features/tenant-selection/tenant-selection.component.spec.ts`
- Test: `src/app/app.routes.spec.ts`

**Interfaces:**
- Consumes: `AuthStore`, `TenantStore`, design primitives.
- Produces: lazy route `/clients/:clientId`, tenant selector `/select-client`, responsive sidebar/header, theme toggle, profile menu, and an inactive notification indicator reserved for the collaboration slice.

- [ ] **Step 1: Write route and shell tests**

```typescript
it('redirects a mismatched client route to tenant selection', async () => {
  tenantStore.select(alpha.id);
  await router.navigateByUrl(`/clients/${beta.id}`);
  expect(router.url).toBe('/select-client');
});

it('labels the tenant switcher with the active client name', () => {
  tenantStore.select(alpha.id);
  fixture.detectChanges();
  expect(screen.getByRole('button', {name: /Alpha/})).toBeTruthy();
});
```

- [ ] **Step 2: Run route and shell tests to verify failure**

Run: `npm test -- --watch=false --include src/app/layouts/app-shell/app-shell.component.spec.ts --include src/app/features/tenant-selection/tenant-selection.component.spec.ts --include src/app/app.routes.spec.ts`

Expected: FAIL because the lazy shell and guard do not exist.

- [ ] **Step 3: Implement lazy route boundaries**

Define public login and invitation routes, authenticated tenant selection, and guarded lazy client routes. The initial client home is a real context/status page, not a fabricated dashboard. Preserve existing unfinished feature components outside the new navigation until their vertical slices migrate them.

- [ ] **Step 4: Implement the responsive shell**

Match Laravel conventions: collapsible desktop sidebar, overlay mobile navigation, fixed top bar, active-client switcher, notification affordance, profile/logout menu, and light/dark toggle. Store only theme and sidebar preference locally. Navigation entries use typed metadata and omit actions the current client role cannot access.

- [ ] **Step 5: Run shell tests and build**

Run: `npm test -- --watch=false --include src/app/layouts/app-shell/app-shell.component.spec.ts --include src/app/features/tenant-selection/tenant-selection.component.spec.ts --include src/app/app.routes.spec.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS with lazy chunks for the shell and tenant-selection feature.

- [ ] **Step 6: Commit the application shell**

```powershell
git add src/app/app.routes.ts src/app/layouts/app-shell src/app/features/tenant-selection src/app/features/home src/app/app.routes.spec.ts
git commit -m "feat: add tenant-aware application shell"
```

### Task 10: Add invitation UI and integrated foundation journeys

**Files:**
- Create: `src/app/features/invitations/invitation.models.ts`
- Create: `src/app/features/invitations/invitation.api.ts`
- Create: `src/app/features/invitations/accept-invitation.component.ts`
- Create: `src/app/features/invitations/accept-invitation.component.html`
- Create: `src/app/features/invitations/manage-invitations.component.ts`
- Create: `src/app/features/invitations/manage-invitations.component.html`
- Create: `src/app/features/invitations/invitations.routes.ts`
- Test: `src/app/features/invitations/accept-invitation.component.spec.ts`
- Test: `src/app/features/invitations/manage-invitations.component.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`
- Create: `e2e/foundation/auth-and-tenancy.spec.ts`
- Create: `e2e/foundation/invitations.spec.ts`
- Create: `docs/parity/foundation-checklist.md`

**Interfaces:**
- Consumes: invitation REST endpoints, Angular shell, auth and tenant stores.
- Produces: client-admin invitation management, invitation acceptance, and Playwright foundation coverage.

- [ ] **Step 1: Write invitation component tests**

```typescript
it('shows expired invitation without an acceptance action', () => {
  api.inspect.and.returnValue(of({...invitation, status: 'EXPIRED'}));
  fixture.componentRef.setInput('token', 'expired-token');
  fixture.detectChanges();
  expect(screen.getByText(/expired/i)).toBeTruthy();
  expect(screen.queryByRole('button', {name: /accept/i})).toBeNull();
});

it('client admin can revoke a pending invitation after confirmation', async () => {
  confirm.open.and.returnValue(of(true));
  await component.revoke(pendingInvitation);
  expect(api.revoke).toHaveBeenCalledWith(alpha.id, pendingInvitation.id);
});
```

- [ ] **Step 2: Run invitation component tests and verify failure**

Run: `npm test -- --watch=false --include src/app/features/invitations/*.spec.ts`

Expected: FAIL because the invitation UI does not exist.

- [ ] **Step 3: Implement inspect, accept, list, create, and revoke flows**

The acceptance page supports unauthenticated users by retaining the invitation token through login and returning after authentication. Existing users accept into their global identity. The management page is visible only to `CLIENT_ADMIN`, masks invitation emails consistently with the backend response, and uses the shared confirmation and toast services.

- [ ] **Step 4: Run component tests**

Run: `npm test -- --watch=false --include src/app/features/invitations/*.spec.ts`

Expected: PASS for pending, expired, revoked, accepted, wrong-email, and API-failure states.

- [ ] **Step 5: Install Playwright and create integrated journeys**

Add `@playwright/test` as a dev dependency and scripts `e2e` and `e2e:ui`. Configure `webServer` entries for Angular and Spring using test environment variables. Implement journeys that:

```typescript
test('user with two memberships switches clients without data leakage', async ({page}) => {
  await loginAs(page, 'multi@example.org', 'Password-123!');
  await page.getByRole('button', {name: /Alpha/}).click();
  await page.getByRole('option', {name: 'Beta'}).click();
  await expect(page).toHaveURL(/\/clients\/[^/]+$/);
  await expect(page.getByTestId('active-client')).toHaveText('Beta');
});

test('invited existing user accepts membership once', async ({page}) => {
  const invitationUrl = await createInvitationFor('invitee@example.org');
  await page.goto(invitationUrl);
  await page.getByRole('button', {name: 'Accept invitation'}).click();
  await expect(page.getByTestId('active-client')).toHaveText('Alpha');
  await page.goto(invitationUrl);
  await expect(page.getByText(/already accepted/i)).toBeVisible();
});
```

- [ ] **Step 6: Create the Laravel parity checklist**

Document checked behavior for login/profile presentation, tenant switcher, invitation lifecycle, heading hierarchy, sidebar density, responsive navigation, empty/loading/error states, dark mode, and audit effects. Each row records Laravel behavior, Angular/Spring behavior, and pass/fail evidence.

- [ ] **Step 7: Run all foundation verification**

Run backend: `cd C:\repos\wpm\pmtool_be; .\mvnw.cmd test`

Expected: PASS.

Run frontend: `cd C:\repos\wpm\pmtool_fe_ng; npm test -- --watch=false`

Expected: PASS.

Run build: `cd C:\repos\wpm\pmtool_fe_ng; npm run build`

Expected: PASS.

Run E2E with both test servers available: `cd C:\repos\wpm\pmtool_fe_ng; npm run e2e`

Expected: PASS in Chromium for authentication, tenant switching, access denial, invitation acceptance, and invitation replay prevention.

- [ ] **Step 8: Commit the completed foundation slice**

```powershell
git add package.json package-lock.json playwright.config.ts e2e docs/parity src/app/features/invitations
git commit -m "feat: complete multi-tenant foundation journey"
```

## Foundation Release Gate

Before starting the projects slice, verify all of the following:

- An empty PostgreSQL database migrates to V1 and Hibernate validates it.
- One identity can hold active memberships in multiple clients.
- Every client-scoped request rejects a missing, mismatched, suspended, or unauthorized tenant context.
- Access and refresh cookies are HTTP-only; refresh rotation rejects replay.
- Invitation tokens are hashed, expire, are single-use, and bind to normalized email.
- Client administrators can manage invitations; members and guests cannot.
- Elevated platform access requires explicit tenant entry and is audited.
- Angular persists no credential and cannot send a mismatched tenant request.
- The shell works on mobile and desktop, supports light/dark themes, and matches the Laravel interaction conventions.
- Backend, frontend, production build, and Playwright suites pass.
- The Laravel foundation parity checklist contains no failing core-release item.
