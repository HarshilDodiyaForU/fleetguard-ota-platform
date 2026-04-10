-- FleetGuard production schema (Supabase PostgreSQL)
-- Run in Supabase SQL Editor (new project or reset).

create extension if not exists pgcrypto;

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- DEVICES
create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  status text not null default 'healthy'
    check (status in ('healthy', 'updating', 'failed', 'warning')),
  region text not null default 'Unassigned',
  cpu float,
  latency float,
  firmware_version text,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_devices_external_id on devices (external_id);
create index if not exists idx_devices_last_seen on devices (last_seen desc);

-- DEPLOYMENTS
create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'failed')),
  progress int default 0,
  created_at timestamptz default now()
);

-- TELEMETRY ("timestamp" is quoted — reserved word in PostgreSQL)
create table if not exists telemetry (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references devices (id) on delete cascade,
  cpu float,
  latency float,
  "timestamp" timestamptz default now()
);

create index if not exists idx_telemetry_device_time on telemetry (device_id, "timestamp" desc);
