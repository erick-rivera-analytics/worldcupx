# RPC Functions

## Auth/Profile

- `is_admin()`
- `current_profile()`
- `technical_email_for_employee(p_cedula text, p_person_name text)`
- `validate_active_employee(p_cedula text)`
- `validate_registration_ticket(p_cedula text, p_ticket_code text)`
- `resolve_auth_email_by_cedula(p_cedula text)`
- `complete_registration_with_ticket(p_cedula text, p_ticket_code text)`
- `register_profile_by_cedula(p_cedula text)` legacy/helper

## Tickets

- `generate_ticket_code()`
- `sell_ticket(p_cedula text, p_purchase_amount numeric default null)`
- `sell_ticket(p_person_id text, p_national_id text, p_person_name text, p_area_id text, p_area_name text, p_job_title text, p_job_classification_code text)`
- `claim_ticket(p_code text)`
- `claim_ticket(p_national_id text, p_ticket_code text)`
- `cancel_ticket(p_ticket_id uuid, p_reason text)`

La sobrecarga nueva de `sell_ticket` se usa desde `#/admin/sales` despues de consultar la Edge Function `pull-person-profile`. Inserta/actualiza `employees`, crea `tickets` y devuelve el codigo `WCX-XXXXXXXX`.

## Predicciones

- `validate_deadline()`
- `save_prediction_match_score(...)`
- `submit_prediction(p_ticket_id uuid)`
- `lock_predictions()`
- `build_predicted_group_standings(p_ticket_id uuid)`
- `build_predicted_bracket(p_ticket_id uuid)`

## Resultados reales

- `save_actual_result(...)`
- `recalculate_actual_group_standings()`
- `build_actual_bracket()`

## Scoring

- `score_match(...)`
- `score_group_positions(p_ticket_id uuid)`
- `score_bracket_crosses(p_ticket_id uuid)`
- `score_advancement(p_ticket_id uuid)`
- `recalculate_ticket_score(p_ticket_id uuid)`
- `recalculate_all_scores()`
