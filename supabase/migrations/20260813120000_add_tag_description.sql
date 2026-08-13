alter table public.tags
  add column if not exists description text not null default '';

alter table public.tags
  add constraint tags_description_length check (length(description) <= 500);
