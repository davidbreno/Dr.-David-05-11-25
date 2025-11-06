# Runs backend with Docker, applies migrations and prints endpoints
param(
  [switch]$Rebuild = $false,
  [switch]$CreateSuperuser = $false
)

$ErrorActionPreference = 'Stop'

# Go to backend folder (this script lives under backend/scripts)
Set-Location -Path (Split-Path -Parent $PSScriptRoot)

Write-Host "[backend] Starting Postgres + Django (Docker)" -ForegroundColor Cyan
if ($Rebuild) {
  docker compose up -d --build
} else {
  docker compose up -d
}

Write-Host "[backend] Applying migrations" -ForegroundColor Cyan
docker compose exec web python manage.py migrate

if ($CreateSuperuser) {
  try {
    docker compose exec -it web python manage.py createsuperuser
  } catch { Write-Warning "[backend] Skipped createsuperuser." }
}

Write-Host "[backend] Done. Endpoints:" -ForegroundColor Green
Write-Host "  API Docs:         http://127.0.0.1:8000/api/docs/"
Write-Host "  Orçamentos:       http://127.0.0.1:8000/api/orcamentos/"
Write-Host "  Pacientes:        http://127.0.0.1:8000/api/pacientes/"
Write-Host "  Admin:            http://127.0.0.1:8000/admin/"
