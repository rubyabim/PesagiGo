param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
)

$resolvedRoot = (Resolve-Path $ProjectRoot).Path

$processes = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object { $_.CommandLine -match [regex]::Escape($resolvedRoot) }

if (-not $processes) {
  Write-Output "No PesagiGo Node.js processes found."
  exit 0
}

foreach ($process in $processes) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    Write-Output "Stopped Node.js process $($process.ProcessId)"
  } catch {
    Write-Output "Cannot stop Node.js process $($process.ProcessId)"
  }
}
