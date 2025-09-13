$body = Get-Content 'f:\Coding-Area\Projects\4-automateOS-v1\test-workflow.json' -Raw
$headers = @{
    'Content-Type' = 'application/json'
    'Idempotency-Key' = 'test_integration_003'
}

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8080/v1/runs' -Method POST -Headers $headers -Body $body
    Write-Host "Run created successfully:"
    $response | ConvertTo-Json -Depth 3
    
    # Poll for status
    $runId = $response.runId
    Write-Host "`nPolling run status for: $runId"
    
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 2
        try {
            $status = Invoke-RestMethod -Uri "http://localhost:8080/v1/runs/$runId" -Method GET
            Write-Host "Status: $($status.status) | Steps: $($status.steps.Count) | Logs: $($status.logs.Count)"
            
            if ($status.status -eq 'succeeded' -or $status.status -eq 'failed') {
                Write-Host "`nFinal result:"
                $status | ConvertTo-Json -Depth 5
                break
            }
        } catch {
            Write-Host "Error polling: $_"
        }
    }
} catch {
    Write-Host "Error creating run: $_"
}
