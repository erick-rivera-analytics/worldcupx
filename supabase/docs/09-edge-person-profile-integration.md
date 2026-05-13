# Integracion Edge Function de personal real

## Arquitectura

La app no llama al tunel de Cloudflare ni al FastAPI local directamente.

Flujo operativo:

1. PostgreSQL local en VM.
2. FastAPI local.
3. Cloudflare Tunnel.
4. Supabase Edge Function `pull-person-profile`.
5. WorldCupX en GitHub Pages.

La URL y llave privadas del API local deben vivir solo como Supabase Secrets:

- `LOCAL_API_URL`
- `LOCAL_API_KEY`

## Edge Function

Proyecto Supabase:

- Ref: `olaziejsdzlwhovdtcnl`
- Function: `pull-person-profile`

El frontend usa:

```ts
supabase.functions.invoke('pull-person-profile', {
  body: { limit: 1000, offset: 0 }
});
```

No se debe hardcodear ninguna URL `trycloudflare.com` ni `LOCAL_API_KEY` en React.

## Paginacion

La app carga paginas de 1000 colaboradores:

- `offset = 0`
- `offset = 1000`
- `offset = 2000`

La carga termina cuando `data.length < 1000`.

## SQL requerido

Ejecutar despues del setup base:

```sql
\i sql/14_real_person_profile_integration.sql
```

Este archivo:

- extiende `employees` con campos del personal real.
- extiende `tickets` con snapshots de auditoria.
- cambia nuevos codigos a formato `WCX-XXXXXXXX`.
- agrega `sell_ticket(person_id, national_id, person_name, ...)`.
- conserva el flujo de registro con `validate_registration_ticket` y `complete_registration_with_ticket`.

## Variables frontend

Local:

```env
VITE_SUPABASE_URL=https://olaziejsdzlwhovdtcnl.supabase.co
VITE_SUPABASE_ANON_KEY=REEMPLAZAR_CON_ANON_KEY
```

GitHub Pages:

- Repository variable: `VITE_SUPABASE_URL`
- Repository secret: `VITE_SUPABASE_ANON_KEY`

## Prueba manual

1. Iniciar sesion como admin TTHH.
2. Ir a `#/admin/sales`.
3. Esperar "colaboradores disponibles en memoria".
4. Buscar por cedula, codigo personal o nombre parcial.
5. Seleccionar colaborador.
6. Presionar "Agregar compra y generar codigo".
7. Copiar el codigo generado.
8. Registrar colaborador con cedula + codigo.

## Pendientes de produccion

- Activar o endurecer Verify JWT de la Edge Function si aplica al modelo operativo.
- Usar Cloudflare Named Tunnel fijo para produccion.
- Revisar que solo `admin_tthh` y `super_admin` tengan perfil admin.
- Auditar periodicamente ventas en `admin_audit_log`.
