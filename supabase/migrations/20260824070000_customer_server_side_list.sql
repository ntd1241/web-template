create index if not exists customers_tenant_created_at_idx
  on public.customers(tenant_id, created_at, id);

create index if not exists tag_assignments_customer_filter_idx
  on public.tag_assignments(tenant_id, subject_type, tag_id, subject_id);

create or replace function public.list_customers(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_tag_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 10), 1), 100);
  v_search text := nullif(btrim(p_search), '');
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'customers:view')
  then
    raise exception 'Customer view permission required' using errcode = '42501';
  end if;

  with filtered_customers as (
    select
      customer.id,
      customer.tenant_id,
      customer.customer_code,
      customer.name,
      customer.business_type,
      customer.business_registration_code,
      customer.image_url,
      customer.country_code,
      customer.region_code,
      customer.region_name,
      customer.phone,
      customer.email,
      customer.address_detail,
      customer.status,
      customer.note,
      customer.created_at,
      count(*) over () as total_count
    from public.customers customer
    where customer.tenant_id = p_tenant_id
      and (
        v_search is null
        or customer.customer_code ilike '%' || v_search || '%'
        or customer.name ilike '%' || v_search || '%'
        or customer.phone ilike '%' || v_search || '%'
        or customer.email ilike '%' || v_search || '%'
        or customer.address_detail ilike '%' || v_search || '%'
      )
      and (
        p_tag_id is null
        or exists (
          select 1
          from public.tag_assignments assignment
          where assignment.tenant_id = customer.tenant_id
            and assignment.subject_type = 'customer'
            and assignment.subject_id = customer.id
            and assignment.tag_id = p_tag_id
        )
      )
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'total_count' - 'created_at'
          order by page_row.created_at asc, page_row.id asc
        )
        from (
          select *
          from filtered_customers
          order by created_at asc, id asc
          offset (v_page - 1) * v_page_size
          limit v_page_size
        ) page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_customers), 0)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_customers(
  uuid, integer, integer, text, uuid
) from public, anon;

grant execute on function public.list_customers(
  uuid, integer, integer, text, uuid
) to authenticated;

notify pgrst, 'reload schema';
