-- Trigger koji automatski kreira organizaciju i worker red
-- kada se registruje novi salon admin

create or replace function public.handle_new_salon_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_org_id uuid;
  v_slug text;
  v_name text;
  v_country text;
  v_currency text;
  v_currency_symbol text;
begin
  -- Samo za salon/org_admin korisnike
  if new.raw_user_meta_data->>'role' != 'org_admin' then
    return new;
  end if;

  v_name := coalesce(new.raw_user_meta_data->>'full_name', 'Moj Salon');
  v_country := coalesce(new.raw_user_meta_data->>'country', 'RS');

  -- Generisi slug iz imena (lowercase, zameni razmake sa crtom)
  v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9\s]', '', 'g'));
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

  -- Kreiraj organizaciju
  insert into public.organizations (name, slug)
  values (v_name, v_slug)
  returning id into v_org_id;

  -- Kreiraj podrazumevana podesavanja
  insert into public.organization_settings (
    organization_id,
    primary_color,
    accent_color,
    background_color,
    text_color,
    font_family,
    button_style,
    payment_enabled,
    payment_mode,
    deposit_percentage,
    cancellation_hours,
    deposit_on_noshow,
    repeat_reminder_enabled,
    review_request_enabled,
    onboarding_completed,
    onboarding_steps,
    country,
    currency,
    currency_symbol
  ) values (
    v_org_id,
    '#e91e8c',
    '#c4186f',
    '#ffffff',
    '#111111',
    'Inter',
    'rounded',
    false,
    'deposit',
    30,
    24,
    false,
    true,
    true,
    false,
    '[]',
    v_country,
    case v_country
      when 'RS' then 'RSD'
      when 'BA' then 'BAM'
      when 'ME' then 'EUR'
      when 'HR' then 'EUR'
      when 'SI' then 'EUR'
      when 'AT' then 'EUR'
      when 'DE' then 'EUR'
      when 'CH' then 'CHF'
      when 'GB' then 'GBP'
      when 'US' then 'USD'
      else 'RSD'
    end,
    case v_country
      when 'RS' then 'din'
      when 'BA' then 'KM'
      when 'ME' then '€'
      when 'HR' then '€'
      when 'SI' then '€'
      when 'AT' then '€'
      when 'DE' then '€'
      when 'CH' then 'CHF'
      when 'GB' then '£'
      when 'US' then '$'
      else 'din'
    end
  );

  -- Kreiraj worker red za vlasnika (owner = org_admin)
  insert into public.workers (organization_id, user_id, name, email, role, is_active)
  values (v_org_id, new.id, v_name, new.email, 'org_admin', true);

  return new;
end;
$$;

-- Postavi trigger na auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_salon_user();
