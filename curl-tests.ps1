$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

Write-Host "1. Signup"
$signupReq = @{ name="Test User"; email="test@example.com"; password="password123" } | ConvertTo-Json
$signupRes = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $signupReq -ContentType "application/json"
$token = $signupRes.token
Write-Host "Token received: $token"

Write-Host "2. Login"
$loginReq = @{ email="test@example.com"; password="password123" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginReq -ContentType "application/json"
Write-Host "Login successful for $($loginRes.user.name)"

Write-Host "3. Create Trip"
$tripReq = @{ name="Europe Tour"; startDate="2027-05-01"; endDate="2027-05-15"; description="A trip to Europe"; coverPhotoUrl=""; budgetLimit=5000.0 } | ConvertTo-Json
$headers = @{ Authorization = "Bearer $token" }
$tripRes = Invoke-RestMethod -Uri "$baseUrl/trips" -Method Post -Headers $headers -Body $tripReq -ContentType "application/json"
$tripId = $tripRes.id
Write-Host "Created Trip ID: $tripId"

Write-Host "4. Add Stop to Trip"
$stopReq = @{ cityId=1; startDate="2027-05-01"; endDate="2027-05-05"; transportCost=500.0; accommodationCost=800.0 } | ConvertTo-Json
$stopRes = Invoke-RestMethod -Uri "$baseUrl/trips/$tripId/stops" -Method Post -Headers $headers -Body $stopReq -ContentType "application/json"
Write-Host "Added Stop ID: $($stopRes.id) for City: $($stopRes.city.name)"

Write-Host "All basic B1 flows tested successfully!"
