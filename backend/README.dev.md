# Execução rápida

## Docker (recomendado)
```pwsh
# Um comando só: sobe containers e aplica migrações
pwsh ./scripts/dev.ps1 -Rebuild
# Endpoints:
#  - Docs:       http://127.0.0.1:8000/api/docs/
#  - Orçamentos: http://127.0.0.1:8000/api/orcamentos/
#  - Pacientes:  http://127.0.0.1:8000/api/pacientes/
#  - Admin:      http://127.0.0.1:8000/admin/
```

## Local sem Docker
```pwsh
# Um comando só: cria venv, instala deps, migra e roda
pwsh ./scripts/local.ps1
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
