insert into storage.buckets (id, name, public)
values ('tenant-assets', 'tenant-assets', true)
on conflict (id) do update set public = excluded.public;

create policy "Tenant admins can read tenant assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tenant-assets'
  and public.has_tenant_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin']::public.tenant_member_role[]
  )
);

create policy "Tenant admins can upload tenant assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tenant-assets'
  and public.has_tenant_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin']::public.tenant_member_role[]
  )
);

create policy "Tenant admins can update tenant assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tenant-assets'
  and public.has_tenant_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin']::public.tenant_member_role[]
  )
)
with check (
  bucket_id = 'tenant-assets'
  and public.has_tenant_role(
    (storage.foldername(name))[1]::uuid,
    array['owner', 'admin']::public.tenant_member_role[]
  )
);
