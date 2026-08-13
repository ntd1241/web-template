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
