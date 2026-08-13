create type public.role_color as enum (
  'blue',
  'violet',
  'red',
  'green',
  'amber',
  'slate'
);

alter table public.roles
  add column color public.role_color not null default 'blue';

update public.roles
set color = case
  when code in ('admin', 'owner') then 'red'::public.role_color
  when code in ('manager', 'quan-ly') then 'violet'::public.role_color
  when code in ('accountant', 'ke-toan') then 'green'::public.role_color
  when code in ('employee', 'nhan-vien') then 'blue'::public.role_color
  else 'amber'::public.role_color
end;
