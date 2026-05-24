param(
  [switch]$Full
)

$root = Resolve-Path (Join-Path $PSScriptRoot '..')

$services = @(
  @{ Name = 'gateway'; Port = 3001; Command = 'npm run start:dev' },
  @{ Name = 'auth'; Port = 3002; Command = 'npm run start:auth:dev' },
  @{ Name = 'admin'; Port = 3009; Command = 'npm run start:admin:dev' },
  @{ Name = 'catalog'; Port = 3006; Command = 'npm run start:catalog:dev' }
)

if ($Full) {
  $services += @(
    @{ Name = 'booking'; Port = 3003; Command = 'npm run start:booking:dev' },
    @{ Name = 'payment'; Port = 3004; Command = 'npm run start:payment:dev' },
    @{ Name = 'ticket'; Port = 3005; Command = 'npm run start:ticket:dev' },
    @{ Name = 'weather'; Port = 3007; Command = 'npm run start:weather:dev' },
    @{ Name = 'quota'; Port = 3008; Command = 'npm run start:quota:dev' }
  )
}

foreach ($service in $services) {
  & (Join-Path $PSScriptRoot 'free-port.ps1') -Port $service.Port
}

foreach ($service in $services) {
  Start-Process powershell `
    -WindowStyle Hidden `
    -WorkingDirectory $root `
    -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $service.Command
  Write-Output "Started $($service.Name) on port $($service.Port)"
}
