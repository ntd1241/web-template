create or replace function public.get_effective_permissions(
  target_tenant_id uuid,
  target_user_id uuid default auth.uid()
)
returns table (permission_code text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if target_user_id <> auth.uid()
    and not public.has_tenant_role(
      target_tenant_id,
      array['owner', 'admin']::public.tenant_member_role[]
    ) then
    raise exception 'Not allowed to inspect another user permissions' using errcode = '42501';
  end if;

  if not public.is_tenant_member(target_tenant_id)
    or not exists (
      select 1
      from public.tenant_members subject_membership
      where subject_membership.tenant_id = target_tenant_id
        and subject_membership.user_id = target_user_id
        and subject_membership.status = 'active'
    ) then
    raise exception 'Active tenant membership required' using errcode = '42501';
  end if;

  return query
  select definition.code
  from public.permission_definitions definition
  where definition.is_active
    and (
      exists (
        select 1
        from public.tenant_member_roles member_role
        join public.role_permissions role_permission
          on role_permission.role_id = member_role.role_id
        where member_role.tenant_id = target_tenant_id
          and member_role.user_id = target_user_id
          and role_permission.permission_code = definition.code
      )
      or exists (
        select 1
        from public.user_permission_overrides permission_override
        where permission_override.tenant_id = target_tenant_id
          and permission_override.user_id = target_user_id
          and permission_override.permission_code = definition.code
          and permission_override.effect = 'allow'
      )
    )
    and not exists (
      select 1
      from public.user_permission_overrides permission_override
      where permission_override.tenant_id = target_tenant_id
        and permission_override.user_id = target_user_id
        and permission_override.permission_code = definition.code
        and permission_override.effect = 'deny'
    )
  order by definition.sort_order, definition.code;
end;
$$;

revoke execute on function public.get_effective_permissions(uuid, uuid) from public, anon;
grant execute on function public.get_effective_permissions(uuid, uuid) to authenticated;
