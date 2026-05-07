param(
  [Parameter(Mandatory = $true)]
  [int]$Port
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Output "Port $Port already free"
  exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($id in $processIds) {
  try {
    Stop-Process -Id $id -Force -ErrorAction Stop
    Write-Output "Stopped process $id on port $Port"
  } catch {
    Write-Output "Cannot stop process $id on port $Port"
  }
}
