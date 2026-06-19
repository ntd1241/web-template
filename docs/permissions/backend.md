# Backend Permissions

Read [`overview.md`](./overview.md) first. The backend authorizes the action and constrains the affected
data regardless of frontend behavior.

## Authentication Payload

The authenticated principal needs stable identity, department identity, role identifiers,
`permissions[]`, and `effectiveScope`. Keep access tokens short-lived and refresh role-derived claims
when permission assignments change.

Do not place sensitive profile data or mutable authorization rules in the token. Revalidate revoked or
changed access according to backend security requirements.

## Permission Enforcement

- Controllers or route handlers declare typed required permission codes.
- A centralized guard checks the authenticated principal before business logic runs.
- Missing authentication returns the authentication failure contract.
- Missing permission returns the forbidden contract.
- High-risk or multi-resource operations may require multiple explicit permissions.

Every protected endpoint is enforced independently; related read access does not imply create, update,
delete, approve, export, or assignment access.

## Scope Enforcement

Apply scope in the service/repository query, not by filtering an already returned result:

- `self`: add the current owner/creator identifier.
- `department`: add the current department identifier.
- `all`: add no scope restriction.

For resource-by-id operations, load or constrain the resource with the same scope before returning or
mutating it. Client-provided owner or department filters never widen access.

## Permission Changes

Role or permission updates must invalidate or refresh affected authorization state. Choose a consistent
mechanism such as token versioning, session invalidation, or forced refresh; document it in backend code
rather than relying on frontend reload behavior.

## Tests

- Each action denied without its exact permission.
- Permission granted but resource outside `self` or `department` scope.
- Mixed roles produce the union of permissions and widest scope.
- Client filters cannot escape server scope.
- Permission changes take effect according to the refresh/invalidation contract.
