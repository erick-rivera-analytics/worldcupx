# Plan Supabase

La app sigue en modo mock hasta cerrar UX, bracket y scoring. El frontend solo debe usar:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Nunca usar `service_role` en frontend.

## Tablas previstas

- `employees`
- `tickets`
- `prediction_match_scores`
- `predicted_group_standings`
- `predicted_bracket_matches`
- `actual_results`
- `actual_bracket_matches`
- `score_details`
- `ticket_scores`
- `scoring_rules` o `app_config`

## RPCs previstas

- `claim_ticket(p_code)`
- `sell_ticket(p_cedula)`
- `register_profile_by_cedula(p_cedula)`
- `save_prediction_draft(...)`
- `submit_prediction(...)`
- `save_actual_result(...)`
- `build_actual_bracket(...)`
- `recalculate_all_scores()`

## Seguridad

- Ranking público no muestra cédula completa.
- Código completo de ticket solo lo ve dueño o admin.
- Resultados reales solo los guarda `admin_tthh` o `super_admin`.
- Validaciones críticas viven en PostgreSQL/RLS/RPC, no solo en UI.
