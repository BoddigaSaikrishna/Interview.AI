<#
.SYNOPSIS
  Apply pending Supabase migrations to a hosted project.

.DESCRIPTION
  This script runs the SQL migrations in backend/supabase/migrations/ against your
  hosted Supabase database. You can either:
    1. Provide a DATABASE_URL environment variable, or
    2. Run the SQL manually in the Supabase Dashboard SQL Editor.

.PARAMETER DatabaseUrl
  PostgreSQL connection string (optional). If not provided, prints the SQL to run manually.

.EXAMPLE
  # Set env and run
  $env:DATABASE_URL = "postgresql://postgres:<password>@<host>:5432/postgres"
  .\scripts\apply-migrations.ps1

  # Or just view the SQL to paste into Supabase Dashboard
  .\scripts\apply-migrations.ps1
#>

param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)

$migrations = @(
  "backend/supabase/migrations/001_create_tables.sql",
  "backend/supabase/migrations/002_add_company_type.sql"
)

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Push-Location $repoRoot

Write-Host "=== Supabase Migration Helper ===" -ForegroundColor Cyan

if (-not $DatabaseUrl) {
  Write-Host "`nNo DATABASE_URL provided. Here is the SQL to run manually in the Supabase Dashboard SQL Editor:`n" -ForegroundColor Yellow

  foreach ($migration in $migrations) {
    $path = Join-Path $repoRoot $migration
    if (Test-Path $path) {
      Write-Host "-- Migration: $migration" -ForegroundColor Green
      Get-Content $path | Write-Host
      Write-Host ""
    } else {
      Write-Host "-- Migration file not found: $path" -ForegroundColor Red
    }
  }

  Write-Host "`nCopy the SQL above and paste it into:" -ForegroundColor Yellow
  Write-Host "  Supabase Dashboard -> SQL -> New Query -> Run" -ForegroundColor Yellow
} else {
  Write-Host "`nUsing DATABASE_URL to apply migrations..." -ForegroundColor Green

  foreach ($migration in $migrations) {
    $path = Join-Path $repoRoot $migration
    if (Test-Path $path) {
      Write-Host "Applying $migration..." -ForegroundColor Cyan
      psql $DatabaseUrl -f $path
      if ($LASTEXITCODE -ne 0) {
        Write-Host "Migration failed: $migration" -ForegroundColor Red
        Pop-Location
        exit 1
      }
    } else {
      Write-Host "Skipping (not found): $path" -ForegroundColor Yellow
    }
  }

  Write-Host "`nAll migrations applied successfully!" -ForegroundColor Green
}

Pop-Location
