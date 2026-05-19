-- Dodaj country i currency u organization_settings
alter table organization_settings
  add column if not exists country text not null default 'RS',
  add column if not exists currency text not null default 'RSD',
  add column if not exists currency_symbol text not null default 'din';

-- Azuriraj payments tabelu da koristi dinamicnu valutu (default ostaje za stare redove)
-- currency kolona vec postoji, samo menjamo default
alter table payments
  alter column currency set default 'RSD';
