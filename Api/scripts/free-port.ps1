param(
  [Parameter(Mandatory = $true)]
  [int]$Port
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Output "Port $Port already free"
  exit 0
}

function Stop-ProcessTree {
  param(
    [Parameter(Mandatory = $true)]
    [int]$ProcessId
  )

  $children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ProcessId" -ErrorAction SilentlyContinue
  foreach ($child in $children) {
    Stop-ProcessTree -ProcessId $child.ProcessId
  }

  try {
    Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    Write-Output "Stopped process $ProcessId"
  } catch {
    Write-Output "Cannot stop process $ProcessId"
  }
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($id in $processIds) {
  Stop-ProcessTree -ProcessId $id
}
