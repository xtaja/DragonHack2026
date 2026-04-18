Remove-Item -ErrorAction SilentlyContinue "$PSScriptRoot\dragonhack26-app\.env.local"

Write-Host ""
Write-Host "  App:     http://localhost:5173"
Write-Host "  Backend: http://localhost:3001"
Write-Host ""

Start-Process powershell -WorkingDirectory "$PSScriptRoot\backend" -ArgumentList "-NoExit", "-Command", "npm run dev"
Start-Process powershell -WorkingDirectory "$PSScriptRoot\dragonhack26-app" -ArgumentList "-NoExit", "-Command", "npm run dev"
