-- 14_real_person_profile_integration.sql
-- Integracion incremental con Edge Function pull-person-profile.
-- No crea ticket_sales: reutiliza employees, tickets, profiles y prediction_headers.

create extension if not exists pgcrypto;

alter table public.employees add column if not exists area_name text;
alter table public.employees add column if not exists gender text;
alter table public.employees add column if not exists associated_worker_name text;
alter table public.employees add column if not exists email text;
alter table public.employees add column if not exists phone_number text;
alter table public.employees add column if not exists job_classification_code text;

alter table public.tickets add column if not exists person_id text;
alter table public.tickets add column if not exists person_name text;
alter table public.tickets add column if not exists area_id text;
alter table public.tickets add column if not exists area_name text;
alter table public.tickets add column if not exists job_title text;
alter table public.tickets add column if not exists job_classification_code text;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'employees_cedula_unique') then
        alter table public.employees add constraint employees_cedula_unique unique (cedula);
    end if;
end $$;

create index if not exists idx_employees_person_id on public.employees (person_id);
create index if not exists idx_employees_area_name on public.employees (area_name);
create index if not exists idx_tickets_person_id on public.tickets (person_id);
create index if not exists idx_tickets_status_created on public.tickets (status, created_at desc);

create or replace function public.generate_ticket_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
    v_code text;
begin
    loop
        v_code := 'WCX-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
        exit when not exists (select 1 from public.tickets where code = v_code);
    end loop;

    return v_code;
end;
$$;

create or replace function public.sell_ticket(
    p_person_id text,
    p_national_id text,
    p_person_name text,
    p_area_id text default null,
    p_area_name text default null,
    p_job_title text default null,
    p_job_classification_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin uuid := auth.uid();
    v_national_id text := regexp_replace(coalesce(p_national_id, ''), '\D', '', 'g');
    v_person_id text := trim(coalesce(p_person_id, ''));
    v_person_name text := trim(coalesce(p_person_name, ''));
    v_employee public.employees%rowtype;
    v_code text;
    v_ticket_id uuid;
begin
    if v_admin is null then
        raise exception 'Usuario no autenticado.';
    end if;
    if not public.is_admin() then
        raise exception 'Solo admin_tthh o super_admin puede vender tickets.';
    end if;
    if v_person_id = '' then
        raise exception 'person_id es requerido.';
    end if;
    if v_national_id = '' then
        raise exception 'national_id es requerido.';
    end if;
    if v_person_name = '' then
        raise exception 'person_name es requerido.';
    end if;

    insert into public.employees (
        cedula,
        person_id,
        person_name,
        area_id,
        area_name,
        cost_area,
        job_title,
        job_classification_code,
        is_active,
        source_updated_at,
        updated_at
    )
    values (
        v_national_id,
        v_person_id,
        v_person_name,
        nullif(trim(coalesce(p_area_id, '')), ''),
        nullif(trim(coalesce(p_area_name, '')), ''),
        nullif(trim(coalesce(p_area_name, '')), ''),
        nullif(trim(coalesce(p_job_title, '')), ''),
        nullif(trim(coalesce(p_job_classification_code, '')), ''),
        true,
        now(),
        now()
    )
    on conflict (cedula)
    do update set
        person_id = excluded.person_id,
        person_name = excluded.person_name,
        area_id = excluded.area_id,
        area_name = excluded.area_name,
        cost_area = excluded.cost_area,
        job_title = excluded.job_title,
        job_classification_code = excluded.job_classification_code,
        is_active = true,
        source_updated_at = now(),
        updated_at = now()
    returning * into v_employee;

    v_code := public.generate_ticket_code();

    insert into public.tickets (
        code,
        employee_id,
        cedula,
        person_id,
        person_name,
        area_id,
        area_name,
        job_title,
        job_classification_code,
        sold_by_user_id,
        status,
        purchase_amount
    )
    values (
        v_code,
        v_employee.id,
        v_employee.cedula,
        v_employee.person_id,
        v_employee.person_name,
        v_employee.area_id,
        v_employee.area_name,
        v_employee.job_title,
        v_employee.job_classification_code,
        v_admin,
        'sold',
        null
    )
    returning id into v_ticket_id;

    insert into public.admin_audit_log (admin_user_id, action, target_table, target_id, payload)
    values (
        v_admin,
        'sell_ticket_real_person_profile',
        'tickets',
        v_ticket_id,
        jsonb_build_object(
            'cedula_masked', left(v_employee.cedula, 2) || '******' || right(v_employee.cedula, 2),
            'person_id', v_employee.person_id,
            'code_masked', left(v_code, 4) || '****'
        )
    );

    return jsonb_build_object(
        'ok', true,
        'ticket_id', v_ticket_id,
        'code', v_code,
        'employee_name', v_employee.person_name,
        'cedula_masked', left(v_employee.cedula, 2) || '******' || right(v_employee.cedula, 2)
    );
end;
$$;

create or replace function public.sell_ticket(p_cedula text, p_purchase_amount numeric default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin uuid := auth.uid();
    v_cedula text := regexp_replace(coalesce(p_cedula, ''), '\D', '', 'g');
    v_employee public.employees%rowtype;
    v_code text;
    v_ticket_id uuid;
begin
    if v_admin is null then
        raise exception 'Usuario no autenticado.';
    end if;
    if not public.is_admin() then
        raise exception 'Solo admin_tthh o super_admin puede vender tickets.';
    end if;

    select * into v_employee from public.employees where cedula = v_cedula and is_active = true;
    if not found then
        raise exception 'Colaborador no encontrado o inactivo.';
    end if;

    v_code := public.generate_ticket_code();

    insert into public.tickets (
        code,
        employee_id,
        cedula,
        person_id,
        person_name,
        area_id,
        area_name,
        job_title,
        job_classification_code,
        sold_by_user_id,
        status,
        purchase_amount
    )
    values (
        v_code,
        v_employee.id,
        v_employee.cedula,
        v_employee.person_id,
        v_employee.person_name,
        v_employee.area_id,
        v_employee.area_name,
        v_employee.job_title,
        v_employee.job_classification_code,
        v_admin,
        'sold',
        p_purchase_amount
    )
    returning id into v_ticket_id;

    insert into public.admin_audit_log (admin_user_id, action, target_table, target_id, payload)
    values (v_admin, 'sell_ticket', 'tickets', v_ticket_id, jsonb_build_object('cedula', v_employee.cedula, 'code_masked', left(v_code, 4) || '****'));

    return jsonb_build_object(
        'ok', true,
        'ticket_id', v_ticket_id,
        'code', v_code,
        'employee_name', v_employee.person_name,
        'cedula_masked', left(v_employee.cedula, 2) || '******' || right(v_employee.cedula, 2)
    );
end;
$$;

create or replace function public.claim_ticket(p_national_id text, p_ticket_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
    v_cedula text := regexp_replace(coalesce(p_national_id, ''), '\D', '', 'g');
    v_code text := upper(trim(coalesce(p_ticket_code, '')));
    v_employee public.employees%rowtype;
    v_profile public.profiles%rowtype;
    v_ticket public.tickets%rowtype;
    v_profile_id uuid;
    v_prediction_id uuid;
begin
    if v_user is null then
        raise exception 'Usuario no autenticado.';
    end if;

    select * into v_employee
    from public.employees
    where cedula = v_cedula
      and is_active = true;

    if not found then
        raise exception 'Codigo no existe o no pertenece a esta cedula.';
    end if;

    select * into v_ticket
    from public.tickets
    where cedula = v_cedula
      and code = v_code
    for update;

    if not found then
        raise exception 'Codigo no existe o no pertenece a esta cedula.';
    end if;
    if v_ticket.status = 'cancelled' then
        raise exception 'Este codigo fue anulado.';
    end if;
    if v_ticket.status = 'claimed' or v_ticket.claimed_by_user_id is not null then
        raise exception 'Este codigo ya fue reclamado.';
    end if;

    select * into v_profile
    from public.profiles
    where user_id = v_user
    limit 1;

    if found and v_profile.cedula <> v_cedula then
        raise exception 'El ticket no pertenece a esta cedula.';
    end if;

    if found then
        v_profile_id := v_profile.id;
    else
        if exists (select 1 from public.profiles where cedula = v_cedula and user_id <> v_user) then
            raise exception 'La cedula ya fue registrada.';
        end if;

        insert into public.profiles (user_id, employee_id, cedula, display_name, area_id, role)
        values (v_user, v_employee.id, v_employee.cedula, v_employee.person_name, v_employee.area_id, 'collaborator')
        returning id into v_profile_id;
    end if;

    update public.tickets
    set status = 'claimed',
        claimed_by_user_id = v_user,
        claimed_at = now(),
        updated_at = now()
    where id = v_ticket.id
    returning * into v_ticket;

    insert into public.prediction_headers (ticket_id, user_id, status)
    values (v_ticket.id, v_user, 'pending')
    on conflict (ticket_id) do update
      set user_id = excluded.user_id,
          updated_at = now()
    returning id into v_prediction_id;

    return jsonb_build_object(
        'ok', true,
        'profile_id', v_profile_id,
        'ticket_id', v_ticket.id,
        'prediction_id', v_prediction_id
    );
end;
$$;

comment on function public.sell_ticket(text, text, text, text, text, text, text) is 'Vende ticket usando colaborador real consultado por Edge Function pull-person-profile. No llama APIs externas desde SQL.';
comment on function public.claim_ticket(text, text) is 'Reclama ticket autenticado por cedula + codigo. Compatible con el contrato de registro/activacion.';

grant execute on function public.sell_ticket(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.sell_ticket(text, numeric) to authenticated;
grant execute on function public.claim_ticket(text, text) to authenticated;
