# Sincronización de empleados activos

Recomendación:

1. Primera versión: carga manual CSV.
2. Producción: ETL programado desde servidor interno o Prefect.

## Opción A: CSV manual

Pros:

- Simple.
- Buena para piloto.
- No requiere exponer red interna.

Contras:

- Depende de operación manual.
- Puede quedar desactualizado.

## Opción B: ETL programado

Script Python/Node ejecutado en servidor seguro:

1. Consulta PostgreSQL/datalakehouse interno.
2. Normaliza cédula.
3. Valida duplicados.
4. Hace upsert en Supabase `employees` por `cedula`.
5. Marca inactivos que ya no aparecen activos.
6. Registra auditoría por batch.

`service_role` solo puede vivir en servidor/CI seguro, nunca en frontend.

## Opción C: Edge Function

No recomendada si el origen está en red privada `10.x`, salvo que exista endpoint seguro, VPN o túnel controlado.

## Opción D: FDW/conexión directa

Solo viable si Supabase puede alcanzar la base origen de forma segura. Tiene alto riesgo por exposición de PostgreSQL interno.

## Tabla destino

```sql
employees (
  id uuid primary key,
  cedula text unique not null,
  person_id text,
  person_name text not null,
  area_id text,
  cost_area text,
  job_title text,
  is_active boolean not null default true,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)
```

## Staging opcional

```sql
employees_staging (
  batch_id uuid not null,
  cedula text,
  person_id text,
  person_name text,
  area_id text,
  cost_area text,
  job_title text,
  is_active boolean,
  source_updated_at timestamptz,
  loaded_at timestamptz not null default now()
)
```

## Consulta tentativa

Requiere validar contra el esquema real:

```sql
select
  profile.cedula,
  profile.person_id,
  profile.person_name,
  area.area_id,
  area.cost_area,
  area.job_title,
  area.source_updated_at
from slv.tthh_asgn_person_area_event_scd2 area
join slv.tthh_dim_person_profile_scd2 profile
  on profile.person_id = area.person_id
where area.is_current = true
  and area.event_type <> 'UNKNOWN'
  and profile.cedula is not null;
```
