# Sites v5 local preview for Windows (no rsync/tmux/cloudflared required).
# Serves zoho-sites/ directly so Design Mode edits show on refresh.
param(
  [int]$Port = 8766,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$Src = Join-Path $Root "zoho-sites"
$Page = "homepage-sites-v5.html"
$Url = "http://127.0.0.1:" + $Port + "/" + $Page

if (-not (Test-Path (Join-Path $Src $Page))) {
  Write-Error ("Missing " + $Src + "\" + $Page + " - open the homepage-fable-preview repo root.")
}

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) {
  Write-Error "Python not found. Install from https://www.python.org/downloads/ (check 'Add to PATH')."
}

$existing = $null
try {
  $existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
} catch {
  $existing = $null
}

if ($existing) {
  Write-Host ("[sites-v5] port " + $Port + " already in use - open " + $Url)
} else {
  Write-Host ("[sites-v5] serving " + $Src + " on port " + $Port)
  Start-Process -FilePath $python.Source -ArgumentList "-m","http.server","$Port" -WorkingDirectory $Src -WindowStyle Minimized
  Start-Sleep -Milliseconds 600
}

Write-Host ("[sites-v5] open " + $Url)
Write-Host "[sites-v5] working file: zoho-sites\homepage-sites-v5.html"
if (-not $NoBrowser) {
  Start-Process $Url
}
