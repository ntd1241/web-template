create extension if not exists unaccent;

create or replace function public.list_contract_receivable_periods(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_status text default null,
  p_sort text default 'periodStart_desc',
  p_due_soon_days integer default 7
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
  v_status text := nullif(btrim(p_status), '');
  v_sort text := coalesce(nullif(btrim(p_sort), ''), 'periodStart_desc');
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  if p_due_soon_days is null or p_due_soon_days < 0 or p_due_soon_days > 365 then
    raise exception 'Invalid due soon days' using errcode = '22023';
  end if;

  if v_status is not null and v_status not in (
    'upcoming', 'unpaid', 'partially_paid', 'not_due', 'paid', 'overdue', 'voided'
  ) then
    raise exception 'Invalid receivable period status' using errcode = '22023';
  end if;

  if v_sort not in (
    'periodStart_desc', 'periodStart_asc', 'dueDate_desc',
    'dueDate_asc', 'amount_desc', 'amount_asc'
  ) then
    raise exception 'Invalid receivable period sort' using errcode = '22023';
  end if;

  with charge_rows as (
    select
      balance.id,
      balance.period_start,
      balance.period_end,
      balance.due_date,
      balance.amount,
      balance.currency_code,
      balance.paid_amount,
      balance.outstanding_amount,
      balance.direction,
      line.name as fee_name,
      line.sort_order
    from public.contract_charge_balances balance
    join public.contract_version_lines line
      on line.id = balance.contract_version_line_id
    where balance.tenant_id = p_tenant_id
      and balance.contract_id = p_contract_id
      and balance.status <> 'voided'
  ), grouped_periods as (
    select
      period_start,
      period_end,
      due_date,
      currency_code,
      direction,
      sum(amount)::numeric(18, 2) as amount,
      sum(paid_amount)::numeric(18, 2) as paid_amount,
      sum(outstanding_amount)::numeric(18, 2) as outstanding_amount,
      string_agg(fee_name, ' ') as fee_names,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'charge_id', id,
          'name', fee_name,
          'amount', amount,
          'outstanding_amount', outstanding_amount,
          'currency_code', currency_code
        ) order by sort_order, id
      ) as fees
    from charge_rows
    group by period_start, period_end, due_date, currency_code, direction
  ), classified_periods as (
    select
      grouped_periods.*,
      case
        when outstanding_amount <= 0 then 'paid'
        when paid_amount > 0 then 'partially_paid'
        when due_date < current_date then 'overdue'
        when due_date > current_date
          and due_date <= current_date + p_due_soon_days then 'upcoming'
        when due_date > current_date + p_due_soon_days then 'not_due'
        else 'unpaid'
      end as display_status,
      case
        when outstanding_amount <= 0 then 'paid'
        when paid_amount > 0 then 'partially_paid'
        when due_date < current_date then 'overdue'
        else 'open'
      end as status
    from grouped_periods
  ), filtered_periods as (
    select
      classified_periods.*,
      count(*) over () as total_count
    from classified_periods
    where (v_status is null or display_status = v_status)
      and (
        v_search is null
        or unaccent(fee_names) ilike '%' || unaccent(v_search) || '%'
        or period_start::text ilike '%' || v_search || '%'
        or period_end::text ilike '%' || v_search || '%'
        or due_date::text ilike '%' || v_search || '%'
        or to_char(period_start, 'DD/MM/YYYY') ilike '%' || v_search || '%'
        or to_char(period_end, 'DD/MM/YYYY') ilike '%' || v_search || '%'
        or to_char(due_date, 'DD/MM/YYYY') ilike '%' || v_search || '%'
      )
  ), page_rows as (
    select *
    from filtered_periods
    order by
      case when v_sort = 'periodStart_desc' then period_start end desc,
      case when v_sort = 'periodStart_asc' then period_start end asc,
      case when v_sort = 'dueDate_desc' then due_date end desc,
      case when v_sort = 'dueDate_asc' then due_date end asc,
      case when v_sort = 'amount_desc' then amount end desc,
      case when v_sort = 'amount_asc' then amount end asc,
      period_start desc,
      period_end desc,
      due_date desc
    offset (v_page - 1) * v_page_size
    limit v_page_size
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'fee_names' - 'total_count'
          order by
            case when v_sort = 'periodStart_desc' then page_row.period_start end desc,
            case when v_sort = 'periodStart_asc' then page_row.period_start end asc,
            case when v_sort = 'dueDate_desc' then page_row.due_date end desc,
            case when v_sort = 'dueDate_asc' then page_row.due_date end asc,
            case when v_sort = 'amount_desc' then page_row.amount end desc,
            case when v_sort = 'amount_asc' then page_row.amount end asc,
            page_row.period_start desc,
            page_row.period_end desc,
            page_row.due_date desc
        )
        from page_rows page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_periods), 0)
  )
  into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_contract_receivable_periods(
  uuid, uuid, integer, integer, text, text, text, integer
) from public, anon;
grant execute on function public.list_contract_receivable_periods(
  uuid, uuid, integer, integer, text, text, text, integer
) to authenticated;
