# Resume Shapeshifter — dev server (fixes Node/npm not on PATH)
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js/npm not found. Install from https://nodejs.org/ then reopen your terminal."
  exit 1
}

Set-Location $PSScriptRoot\..
Write-Host "Starting dev server at http://localhost:3000"
npm run dev
