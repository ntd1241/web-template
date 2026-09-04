-- Align custom-field RLS with the permission catalog used by the current product.
-- The initial migration used the retired system:settings:* codes.

drop policy if exists "Members with settings view can view custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with settings edit can create custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with settings edit can update custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with settings edit can delete custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with settings view can view custom field options"
  on public.tenant_custom_field_options;
drop policy if exists "Members with settings edit can manage custom field options"
  on public.tenant_custom_field_options;

create policy "Members with tenant view can view custom field definitions"
on public.tenant_custom_field_definitions
for select to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:custom-field:view')
);

create policy "Members with tenant update can create custom field definitions"
on public.tenant_custom_field_definitions
for insert to authenticated
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:create'));

create policy "Members with tenant update can update custom field definitions"
on public.tenant_custom_field_definitions
for update to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'));

create policy "Members with tenant update can delete custom field definitions"
on public.tenant_custom_field_definitions
for delete to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:delete'));

create policy "Members with tenant view can view custom field options"
on public.tenant_custom_field_options
for select to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.is_tenant_member(definition.tenant_id)
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:view')
  )
);

create policy "Members with tenant update can manage custom field options"
on public.tenant_custom_field_options
for all to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
)
with check (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
);

grant select, insert, update, delete on public.tenant_custom_field_definitions to authenticated;
grant select, insert, update, delete on public.tenant_custom_field_options to authenticated;
grant select, insert, update, delete on public.entity_custom_data to authenticated;
