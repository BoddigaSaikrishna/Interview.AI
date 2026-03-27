 # Simple PowerShell script to test Supabase sign-up endpoint locally.
 # Prerequisites:
 # - Start local Supabase services: `supabase start`
 # - Serve functions if needed: `supabase functions serve interview-ai --env-file supabase/.env`
 # - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in your environment
 #   or provide them when prompted.

 # Move to script directory
 $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
 Set-Location $scriptDir

 # Load default values from environment or prompt
 $supabaseUrl = $env:VITE_SUPABASE_URL
 if (-not $supabaseUrl -or $supabaseUrl -eq '') {
     $supabaseUrl = Read-Host 'Enter Supabase URL (default: http://localhost:54321)'
     if (-not $supabaseUrl -or $supabaseUrl -eq '') { $supabaseUrl = 'http://localhost:54321' }
 }

 $apiKey = $env:VITE_SUPABASE_PUBLISHABLE_KEY
 if (-not $apiKey -or $apiKey -eq '') {
     $apiKey = Read-Host 'Enter Supabase anon/public key (press Enter to use "anon_or_demo_key")'
     if (-not $apiKey -or $apiKey -eq '') { $apiKey = 'anon_or_demo_key' }
 }

 Write-Host "Using Supabase URL: $supabaseUrl"

 $email = Read-Host 'Test email (e.g., test+1@example.com)'
 $password = Read-Host 'Password (min 6 chars)'

 $body = @{ email = $email; password = $password } | ConvertTo-Json

 try {
     $resp = Invoke-RestMethod -Method Post -Uri "$supabaseUrl/auth/v1/signup" -Headers @{ apikey = $apiKey; Authorization = "Bearer $apiKey" } -Body $body -ContentType 'application/json' -ErrorAction Stop
     Write-Host "Response:" -ForegroundColor Green
     $resp | ConvertTo-Json -Depth 5 | Write-Host
 } catch {
     Write-Host "Error from signup call:" -ForegroundColor Red
     if ($_.Exception.Response -ne $null) {
         $content = $_.Exception.Response.GetResponseStream() | New-Object System.IO.StreamReader
         Write-Host ($content.ReadToEnd())
     } else {
         Write-Host $_.Exception.Message
     }
 }

 Write-Host "`nIf you expect an email confirmation flow, check Supabase Auth settings and your mail simulator (or real SMTP)."