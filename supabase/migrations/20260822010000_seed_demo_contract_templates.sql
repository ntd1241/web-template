-- Seed a useful set of contract templates for the active Vacom demo tenant.
-- Keep this migration idempotent so refreshing the demo database does not
-- create duplicate templates or versions.
do $$
declare
  v_tenant_id uuid;
  v_actor_id uuid;
  v_template_id uuid;
  v_version_id uuid;
  v_seed record;
begin
  select tenant.id
  into v_tenant_id
  from public.tenants tenant
  where tenant.name = 'Công ty TNHH Vacom'
    and tenant.status = 'active'
  order by tenant.created_at
  limit 1;

  if v_tenant_id is null then
    raise notice 'Demo tenant Công ty TNHH Vacom not found; skipping template seed.';
    return;
  end if;

  select member.user_id
  into v_actor_id
  from public.tenant_members member
  where member.tenant_id = v_tenant_id
    and member.status = 'active'
  order by case when member.role in ('owner', 'admin') then 0 else 1 end,
    member.created_at
  limit 1;

  for v_seed in
    select *
    from (
      values
        (
          'DVKT-COBAN',
          'Kế toán dịch vụ cơ bản',
          'Gói dịch vụ kế toán định kỳ cho doanh nghiệp nhỏ.',
          'published'::public.contract_template_status,
          'VND',
          false,
          'Mẫu demo có phí định kỳ, phí bảo trì và phí setup một lần.',
          jsonb_build_array(
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí dịch vụ kế toán tháng',
              'quantity', 1,
              'unit_price', 1500000,
              'billing_type', 'recurring',
              'billing_unit', 'month',
              'billing_interval', 1,
              'due_rule', 'on_period_end'
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí bảo trì tháng',
              'quantity', 1,
              'unit_price', 500000,
              'billing_type', 'recurring',
              'billing_unit', 'month',
              'billing_interval', 1,
              'due_rule', 'on_period_end'
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí setup ban đầu',
              'quantity', 1,
              'unit_price', 750000,
              'billing_type', 'one_time',
              'charge_date', current_date,
              'due_rule', 'on_period_start'
            )
          )
        ),
        (
          'DVKT-DOANHNGHIEP',
          'Kế toán doanh nghiệp',
          'Gói dịch vụ dành cho doanh nghiệp có nhu cầu theo dõi thuế và báo cáo định kỳ.',
          'published'::public.contract_template_status,
          'VND',
          true,
          'Mẫu demo cho khách hàng doanh nghiệp có gia hạn tự động.',
          jsonb_build_array(
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí kế toán doanh nghiệp tháng',
              'quantity', 1,
              'unit_price', 3500000,
              'billing_type', 'recurring',
              'billing_unit', 'month',
              'billing_interval', 1,
              'due_rule', 'after_days',
              'due_days', 5
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí báo cáo thuế quý',
              'quantity', 1,
              'unit_price', 4500000,
              'billing_type', 'recurring',
              'billing_unit', 'quarter',
              'billing_interval', 1,
              'due_rule', 'on_period_end'
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí onboarding',
              'quantity', 1,
              'unit_price', 1200000,
              'billing_type', 'one_time',
              'charge_date', current_date,
              'due_rule', 'after_days',
              'due_days', 7
            )
          )
        ),
        (
          'BCTC-CUOINAM',
          'Báo cáo tài chính cuối năm',
          'Mẫu dịch vụ theo mùa vụ cho báo cáo tài chính và quyết toán cuối năm.',
          'published'::public.contract_template_status,
          'VND',
          false,
          'Mẫu demo chủ yếu sử dụng khoản phí một lần.',
          jsonb_build_array(
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí lập báo cáo tài chính',
              'quantity', 1,
              'unit_price', 8000000,
              'billing_type', 'one_time',
              'charge_date', current_date,
              'due_rule', 'after_days',
              'due_days', 15
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí tư vấn quyết toán',
              'quantity', 1,
              'unit_price', 2500000,
              'billing_type', 'one_time',
              'charge_date', current_date,
              'due_rule', 'on_period_end'
            )
          )
        ),
        (
          'STARTUP-TIETKIEM',
          'Gói startup tiết kiệm',
          'Mẫu nháp để tiếp tục tùy chỉnh trước khi phát hành cho khách hàng.',
          'draft'::public.contract_template_status,
          'VND',
          false,
          'Mẫu demo ở trạng thái bản nháp.',
          jsonb_build_array(
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí dịch vụ startup tháng',
              'quantity', 1,
              'unit_price', 1000000,
              'billing_type', 'recurring',
              'billing_unit', 'month',
              'billing_interval', 1,
              'due_rule', 'on_period_start'
            ),
            jsonb_build_object(
              'direction', 'receivable',
              'name', 'Phí tư vấn thêm',
              'quantity', 2,
              'unit_price', 300000,
              'billing_type', 'one_time',
              'charge_date', current_date,
              'due_rule', 'on_period_start'
            )
          )
        )
    ) as seed(
      code,
      name,
      description,
      status,
      currency_code,
      auto_renew_default,
      note,
      lines
    )
  loop
    insert into public.contract_templates (
      tenant_id,
      code,
      name,
      description,
      status,
      currency_code,
      auto_renew_default,
      note,
      created_by
    )
    values (
      v_tenant_id,
      v_seed.code,
      v_seed.name,
      v_seed.description,
      v_seed.status,
      v_seed.currency_code,
      v_seed.auto_renew_default,
      v_seed.note,
      v_actor_id
    )
    on conflict (tenant_id, code) do update set
      name = excluded.name,
      description = excluded.description,
      status = excluded.status,
      currency_code = excluded.currency_code,
      auto_renew_default = excluded.auto_renew_default,
      note = excluded.note,
      updated_at = timezone('utc', now())
    returning id into v_template_id;

    insert into public.contract_template_versions (
      template_id,
      version_no,
      status,
      terms_snapshot,
      created_by,
      published_at
    )
    values (
      v_template_id,
      1,
      (case when v_seed.status = 'published' then 'published' else 'draft' end)::public.contract_template_version_status,
      jsonb_build_object(
        'code', v_seed.code,
        'name', v_seed.name,
        'description', v_seed.description,
        'currencyCode', v_seed.currency_code,
        'autoRenewDefault', v_seed.auto_renew_default,
        'note', v_seed.note
      ),
      v_actor_id,
      case when v_seed.status = 'published' then timezone('utc', now()) else null end
    )
    on conflict (template_id, version_no) do update set
      status = excluded.status,
      terms_snapshot = excluded.terms_snapshot,
      published_at = excluded.published_at,
      updated_at = timezone('utc', now())
    returning id into v_version_id;

    delete from public.contract_template_version_lines
    where template_version_id = v_version_id;

    insert into public.contract_template_version_lines (
      template_version_id,
      direction,
      name,
      quantity,
      unit_price,
      billing_type,
      billing_unit,
      billing_interval,
      charge_date,
      due_rule,
      due_days,
      start_date,
      end_date,
      sort_order
    )
    select
      v_version_id,
      line.direction::public.contract_cashflow_direction,
      line.name,
      line.quantity,
      line.unit_price,
      line.billing_type::public.contract_billing_type,
      line.billing_unit::public.contract_billing_unit,
      line.billing_interval,
      line.charge_date,
      line.due_rule::public.contract_due_rule,
      line.due_days,
      current_date,
      null,
      coalesce(line.sort_order, (row_number() over () - 1)::integer)
    from jsonb_to_recordset(v_seed.lines) as line(
      direction text,
      name text,
      quantity numeric,
      unit_price numeric,
      billing_type text,
      billing_unit text,
      billing_interval integer,
      charge_date date,
      due_rule text,
      due_days integer,
      sort_order integer
    );
  end loop;
end;
$$;
