revoke update on public.user_profiles from authenticated;

grant update (
  display_name,
  first_name,
  last_name,
  avatar_url,
  locale,
  timezone,
  settings,
  metadata
)
on public.user_profiles to authenticated;
