# Runs backend locally with venv + migrate + runserver
$ErrorActionPreference = 'Stop'

# Go to backend folder
Set-Location -Path (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path .venv)) {
  Write-Host "[backend] Creating venv" -ForegroundColor Cyan
  python -m venv .venv
}

Write-Host "[backend] Activating venv" -ForegroundColor Cyan
$activate = Join-Path .venv 'Scripts/Activate.ps1'
. $activate

Write-Host "[backend] Installing requirements" -ForegroundColor Cyan
pip install --upgrade pip > $null
pip install -r requirements.txt

Write-Host "[backend] Applying migrations" -ForegroundColor Cyan
python manage.py migrate

Write-Host "[backend] Running server on http://127.0.0.1:8000" -ForegroundColor Green
python manage.py runserver
