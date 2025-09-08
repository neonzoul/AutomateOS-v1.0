# Test script for the mock API endpoints

Write-Host "Testing POST /api/v1/runs..." -ForegroundColor Yellow

# Test POST /api/v1/runs
try {
    $createResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/runs" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"workflowVersionId": "test-workflow"}'
    Write-Host "✓ POST /api/v1/runs successful" -ForegroundColor Green
    Write-Host "Run ID: $($createResult.id)" -ForegroundColor Cyan
    Write-Host "Status: $($createResult.status)" -ForegroundColor Cyan
    
    $runId = $createResult.id
    
    Write-Host "`nTesting GET /api/v1/runs/$runId..." -ForegroundColor Yellow
    
    # Test multiple GET requests to see state transitions
    for ($i = 1; $i -le 4; $i++) {
        Write-Host "Poll $i..." -ForegroundColor Blue
        $getResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/runs/$runId" -Method GET
        Write-Host "Status: $($getResult.status)" -ForegroundColor Cyan
        Write-Host "Steps: $($getResult.steps.Count)" -ForegroundColor Cyan
        Write-Host "Logs: $($getResult.logs.Count)" -ForegroundColor Cyan
        
        if ($getResult.status -eq "succeeded") {
            Write-Host "✓ Workflow completed successfully!" -ForegroundColor Green
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
} catch {
    Write-Host "✗ Error testing API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Yellow
