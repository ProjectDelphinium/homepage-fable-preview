# One-shot Windows setup: clone (or update) homepage-fable-preview, checkout
# the Sites polish branch, start local preview, open the browser.
#
# Run in PowerShell (no admin needed):
#   powershell -ExecutionPolicy Bypass -File .\scripts\windows\setup-and-preview.ps1

param(
  [string]$RepoUrl = "https://github.com/ProjectDelphinium/homepage-fable-preview.git",
  [string]$Branch = "cursor/hero-h1-first-line-25b0",
  [string]$TargetDir = "",
  [int]$Port = 8766
)

$ErrorActionPreference = "Stop"

function Require-Cmd([string]$Name, [string]$Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Missing '$Name'. $Hint"
  }
}

Require-Cmd "git" "Install Git for Windows: https://git-scm.com/download/win"
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python3 -ErrorAction SilentlyContinue }
if (-not $python) {
  Write-Error "Missing Python. Install from https://www.python.org/downloads/ and check 'Add python.exe to PATH'."
}

if (-not $TargetDir) {
  $TargetDir = Join-Path $HOME "Documents\homepage-fable-preview"
}

$parent = Split-Path -Parent $TargetDir
if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent | Out-Null }

if (-not (Test-Path (Join-Path $TargetDir ".git"))) {
  Write-Host "[setup] cloning $RepoUrl -> $TargetDir"
  git clone $RepoUrl $TargetDir
} else {
  Write-Host "[setup] repo already at $TargetDir - fetching"
}

Set-Location $TargetDir
git fetch origin $Branch
git checkout $Branch
git pull --ff-only origin $Branch

Write-Host ("[setup] branch: " + (git branch --show-current))
Write-Host ("[setup] starting Sites v5 preview on port " + $Port)

& (Join-Path $TargetDir "scripts\windows\sites-v5-preview.ps1") -Port $Port

Write-Host ""
Write-Host "[setup] Next in Cursor Desktop:"
Write-Host ("  File -> Open Folder -> " + $TargetDir)
Write-Host ("  Open Simple Browser / Design Mode on http://127.0.0.1:" + $Port + "/homepage-sites-v5.html")
Write-Host "  Drop real .svg files into zoho-sites\assets\ (chat uploads flatten SVG to PNG)"
Write-Host "  Multitask Mode: OFF for rapid Design Mode"
