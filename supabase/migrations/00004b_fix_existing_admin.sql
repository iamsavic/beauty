-- Pokreni ovo JEDNOM za vec kreirane salon admin naloge koji nemaju organizaciju.
-- Zameni 'TVOJ_USER_ID' sa pravim UUID-om iz Supabase Authentication tabele.

do $$
declare
  v_user_id uuid;
  v_user_email text;
  v_org_id uuid;
  v_slug text;
  v_name text;
begin
  -- Uzmi sve auth usere sa ulogom org_admin koji jos nemaju worker red
  for v_user_id, v_user_email, v_name in
    select
      au.id,
      au.email,
      coalesce(au.raw_user_meta_data->>'full_name', 'Moj Salon')
    from auth.users au
    where au.raw_user_meta_data->>'role' = 'org_admin'
      and not exists (
        select 1 from public.workers w where w.user_id = au.id
      )
  loop
    v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9\s]', '', 'g'));
    v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
    v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

    insert into public.organizations (name, slug)
    values (v_name, v_slug)
    returning id into v_org_id;

    insert into public.organization_settings (
      organization_id, primary_color, accent_color, background_color,
      text_color, font_family, button_style, payment_enabled, payment_mode,
      deposit_percentage, cancellation_hours, deposit_on_noshow,
      repeat_reminder_enabled, review_request_enabled, onboarding_completed,
      onboarding_steps, country, currency, currency_symbol
    ) values (
      v_org_id, '#e91e8c', '#c4186f', '#ffffff', '#111111',
      'Inter', 'rounded', false, 'deposit', 30, 24, false,
      true, true, false, '[]', 'RS', 'RSD', 'din'
    );

    insert into public.workers (organization_id, user_id, name, email, role, is_active)
    values (v_org_id, v_user_id, v_name, v_user_email, 'org_admin', true);

    raise notice 'Kreirana organizacija "%" za user %', v_name, v_user_id;
  end loop;
end;
$$;
