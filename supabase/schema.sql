-- =============================================================================
--  BMA — schéma Supabase
-- =============================================================================
--  À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run.
--  Le script est ré-exécutable sans risque : tout est en « if not exists ».
--
--  Deux tables et un bucket, rien de plus :
--    · vehicles  — le parc, un enregistrement par voiture
--    · users     — qui a le droit d'entrer dans le back-office
--    · vehicules — le seau de stockage des photos (créé plus bas, côté Storage)
-- =============================================================================


-- ------------------------------------------------------------------ véhicules
--  Les colonnes reprennent une à une l'interface `Vehicle` de src/data/vehicles.ts.
--  Aucune traduction de nom n'est nécessaire : les deux mondes parlent le même
--  vocabulaire, ce qui évite une couche de correspondance et les bugs qui vont
--  avec.
create table if not exists public.vehicles (
  slug        text primary key,

  -- L'ordre d'affichage du parc, réécrit par le glisser-déposer du back-office.
  -- Un entier plutôt qu'un rang implicite : insérer en tête revient à prendre
  -- min(position) - 1, sans toucher aux autres lignes.
  position    integer     not null default 0,

  brand       text        not null,
  model       text        not null,
  body        text        not null default 'suv',
  year        integer     not null,
  mileage     text        not null default '',
  gearbox     text        not null default '',
  fuel        text        not null default '',
  seats       integer     not null default 5,
  engine      text        not null default '',
  power       text        not null default '',
  color       text        not null default '',
  drivetrain  text        not null default '',
  bodywork    text        not null default '',
  origin      text        not null default '',

  -- Prix en FCFA. NULL = « Prix sur demande » (et non zéro : un prix de zéro
  -- s'afficherait comme « 0 FCFA »).
  price       bigint,

  swatches    text[]      not null default '{}',
  note        text        not null default '',
  equipment   text[]      not null default '{}',
  featured    boolean     not null default false,
  photos      text[]      not null default '{}',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists vehicles_position_idx on public.vehicles (position, created_at desc);


-- --------------------------------------------------------------- utilisateurs
--  superadmin : gère le parc ET les comptes.
--  assistant  : gère le parc uniquement — il ne voit même pas la page Comptes.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('superadmin', 'assistant');
  end if;
end $$;

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),

  -- Toujours stocké en minuscules par l'application : « Awa@bma.sn » et
  -- « awa@bma.sn » doivent désigner le même compte, sinon on peut créer deux
  -- comptes qui se ressemblent et n'en débusquer aucun.
  email         text not null unique,
  name          text not null default '',

  -- scrypt, format « scrypt$<sel hex>$<empreinte hex> ». Jamais le mot de passe.
  password_hash text not null,

  role          public.user_role not null default 'assistant',

  -- Désactiver plutôt que supprimer : on coupe l'accès sans perdre la trace de
  -- qui a saisi quoi. La suppression reste possible, elle est juste rarement le
  -- bon geste.
  active        boolean not null default true,

  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);


-- ------------------------------------------------------- garde-fou superadmin
--  Se verrouiller dehors est une panne dont on ne se relève qu'en SQL. La base
--  refuse donc de laisser le parc sans aucun superadmin actif, quelle que soit
--  l'erreur commise dans l'interface.
create or replace function public.guard_last_superadmin()
returns trigger
language plpgsql
as $$
begin
  -- On ne s'intéresse qu'au cas où l'on retire son pouvoir au dernier
  -- superadmin actif : suppression, rétrogradation, ou désactivation.
  if old.role = 'superadmin' and old.active
     and (tg_op = 'DELETE' or new.role <> 'superadmin' or not new.active)
     and not exists (
       select 1 from public.users
       where role = 'superadmin' and active and id <> old.id
     )
  then
    raise exception 'Il doit rester au moins un superadmin actif.';
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists users_guard_last_superadmin on public.users;
create trigger users_guard_last_superadmin
  before update or delete on public.users
  for each row execute function public.guard_last_superadmin();


-- ------------------------------------------------------------------------ RLS
--  Row Level Security activée, et AUCUNE policy. Ce n'est pas un oubli :
--  sans policy, PostgREST refuse tout aux clés publiques (anon, authenticated),
--  tandis que la clé `service_role` contourne RLS par construction.
--
--  Or le site n'interroge la base que depuis le serveur Next, avec cette clé.
--  Résultat : la base est totalement fermée depuis l'extérieur — personne ne
--  peut lire la table `users` ni écrire dans `vehicles` en appelant l'API
--  Supabase directement, même en connaissant l'URL du projet.
alter table public.vehicles enable row level security;
alter table public.users    enable row level security;


-- ------------------------------------------------------------- horodatage
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists vehicles_touch on public.vehicles;
create trigger vehicles_touch
  before update on public.vehicles
  for each row execute function public.touch_updated_at();
