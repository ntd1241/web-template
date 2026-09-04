-- Atomically replace one tenant/entity custom-field configuration.
-- The caller sends the complete editor-table draft so definitions, ordering,
-- removed rows and select options cannot be persisted only partially.

create or replace function public.save_tenant_custom_fields(
  p_tenant_id uuid,
  p_entity_type public.custom_field_entity_type,
  p_fields jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  field_item jsonb;
  option_item jsonb;
  field_id uuid;
  incoming_ids uuid[] := '{}'::uuid[];
  row_index integer := 0;
  field_type public.custom_field_type;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not public.is_tenant_member(p_tenant_id) then
    raise exception 'Tenant membership required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_fields) <> 'array' then
    raise exception 'Custom fields payload must be an array' using errcode = '22023';
  end if;

  for field_item in
    select value
    from jsonb_array_elements(p_fields)
  loop
    row_index := row_index + 1;
    field_id := null;

    if nullif(field_item->>'id', '') is not null then
      field_id := (field_item->>'id')::uuid;

      if not exists (
        select 1
        from public.tenant_custom_field_definitions definition
        where definition.id = field_id
          and definition.tenant_id = p_tenant_id
          and definition.entity_type = p_entity_type
      ) then
        raise exception 'Custom field does not belong to this tenant/entity'
          using errcode = '22023';
      end if;

      if not public.has_tenant_permission(
        p_tenant_id,
        'organization:custom-field:update'
      ) then
        raise exception 'Custom field update permission required'
          using errcode = '42501';
      end if;

      update public.tenant_custom_field_definitions
      set
        field_key = btrim(field_item->>'key'),
        label = btrim(field_item->>'label'),
        field_type = (field_item->>'fieldType')::public.custom_field_type,
        is_required = coalesce((field_item->>'isRequired')::boolean, false),
        is_active = coalesce((field_item->>'isActive')::boolean, true),
        sort_order = row_index - 1
      where id = field_id;
    else
      if not public.has_tenant_permission(
        p_tenant_id,
        'organization:custom-field:create'
      ) then
        raise exception 'Custom field create permission required'
          using errcode = '42501';
      end if;

      insert into public.tenant_custom_field_definitions (
        tenant_id,
        entity_type,
        field_key,
        label,
        field_type,
        is_required,
        is_active,
        sort_order
      )
      values (
        p_tenant_id,
        p_entity_type,
        btrim(field_item->>'key'),
        btrim(field_item->>'label'),
        (field_item->>'fieldType')::public.custom_field_type,
        coalesce((field_item->>'isRequired')::boolean, false),
        coalesce((field_item->>'isActive')::boolean, true),
        row_index - 1
      )
      returning id into field_id;
    end if;

    incoming_ids := array_append(incoming_ids, field_id);
    field_type := (field_item->>'fieldType')::public.custom_field_type;

    delete from public.tenant_custom_field_options
    where tenant_custom_field_options.field_id = field_id;

    if field_type = 'select' then
      for option_item in
        select value
        from jsonb_array_elements(coalesce(field_item->'options', '[]'::jsonb))
      loop
        insert into public.tenant_custom_field_options (
          field_id,
          value,
          label,
          sort_order
        )
        values (
          field_id,
          btrim(option_item->>'value'),
          btrim(option_item->>'label'),
          (select count(*)::integer
           from public.tenant_custom_field_options existing_option
           where existing_option.field_id = field_id)
        );
      end loop;
    end if;
  end loop;

  if exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.tenant_id = p_tenant_id
      and definition.entity_type = p_entity_type
      and not (definition.id = any(incoming_ids))
  ) then
    if not public.has_tenant_permission(
      p_tenant_id,
      'organization:custom-field:delete'
    ) then
      raise exception 'Custom field delete permission required'
        using errcode = '42501';
    end if;

    delete from public.tenant_custom_field_definitions definition
    where definition.tenant_id = p_tenant_id
      and definition.entity_type = p_entity_type
      and not (definition.id = any(incoming_ids));
  end if;
end;
$$;

revoke all on function public.save_tenant_custom_fields(uuid, public.custom_field_entity_type, jsonb)
from public, anon;
grant execute on function public.save_tenant_custom_fields(uuid, public.custom_field_entity_type, jsonb)
to authenticated;
