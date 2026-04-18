$ip = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
    Select-Object -First 1).IPAddress

if ($ip) {
    Set-Content -Path "$PSScriptRoot\dragonhack26-app\.env.local" -Value "VITE_SOCKET_URL=http://$ip`:3001" -NoNewline
    Write-Host ""
    Write-Host "  App:     http://$ip`:5173"
    Write-Host "  Backend: http://$ip`:3001"
    Write-Host ""
} else {
    Write-Host "Could not detect local IP"
    Write-Host "Set VITE_SOCKET_URL manually in dragonhack26-app\.env.local"
}

Start-Process powershell -WorkingDirectory "$PSScriptRoot\backend" -ArgumentList '-NoExit', '-Command', 'npm run dev'
Start-Process powershell -WorkingDirectory "$PSScriptRoot\dragonhack26-app" -ArgumentList '-NoExit', '-Command', 'npx vite --host'
