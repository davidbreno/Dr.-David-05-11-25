# Execução rápida

## Docker (recomendado)
```bash
cp .env.example .env
make up
# API: http://127.0.0.1:8000/api/pacientes/
# Admin: http://127.0.0.1:8000/admin
```

## Local sem Docker
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # ajuste DB_HOST=localhost se usar Postgres local
python manage.py migrate
python manage.py createsuperuser
python manage.py setup_roles
python manage.py runserver
```

## Autenticação JWT
1. Obter token:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/token/ \
     -H "Content-Type: application/json" \     -d '{"username":"SEU_USER","password":"SUA_SENHA"}'
   ```
2. Usar o token:
   ```bash
   curl -H "Authorization: Bearer SEU_TOKEN" http://127.0.0.1:8000/api/pacientes/
   ```

## Endpoints
- Pacientes: `/api/pacientes/`
- Orçamentos: `/api/orcamentos/`
- Odontograma: `/api/odontogramas/`
- Financeiro: `/api/lancamentos/`
- Estoque: `/api/produtos/`
