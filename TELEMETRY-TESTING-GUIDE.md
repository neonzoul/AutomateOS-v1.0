# Telemetry Testing Guide

## 🔍 What is Telemetry?

The telemetry system provides **distributed tracing** capabilities that help you:

1. **Track Operations**: See how long operations take
2. **Follow Request Flow**: Trace requests across services
3. **Monitor Performance**: Identify slow operations
4. **Debug Issues**: Find where errors occur in the call chain
5. **Observe System Health**: Get insights into system behavior

## 📊 Telemetry Output Examples

### Span Start (Operation Begins)

```json
{
  "ts": "2025-09-13T02:39:14.623Z",
  "level": "debug",
  "msg": "span.start",
  "component": "Telemetry",
  "traceId": "k7j6cd3sbx9",
  "spanId": "brxobe5m3bf",
  "operation": "orchestrator.startRunWithDag",
  "runId": "run_mfhnqv27",
  "attributes": {
    "runId": "run_mfhnqv27",
    "nodeCount": 2
  }
}
```

### Span End (Operation Completes)

```json
{
  "ts": "2025-09-13T02:39:15.848Z",
  "level": "info",
  "msg": "span.end",
  "component": "Telemetry",
  "traceId": "k7j6cd3sbx9",
  "spanId": "brxobe5m3bf",
  "operation": "orchestrator.startRunWithDag",
  "runId": "run_mfhnqv27",
  "duration": 1225,
  "success": true,
  "attributes": {
    "runId": "run_mfhnqv27",
    "nodeCount": 2
  }
}
```

## 🧪 How to Test Telemetry

### Method 1: Live Integration Test

1. **Start Log Monitoring**:

```powershell
cd f:\Coding-Area\Projects\4-automateOS-v1
docker-compose -f infra/docker-compose.dev.yml logs orchestrator --follow
```

2. **Trigger a Workflow**:

```powershell
powershell -ExecutionPolicy Bypass -File "test-integration.ps1"
```

3. **Look for Telemetry Logs**:

- `span.start` when operations begin
- `span.end` when operations complete
- `span.error` if operations fail

### Method 2: Browser Frontend Test

1. **Open Builder**: http://localhost:3000/builder
2. **Add Nodes**: Click "+ Start" then "+ HTTP"
3. **Connect Nodes**: Drag from Start to HTTP node
4. **Run Workflow**: Click "Run" button
5. **Watch Logs**: Monitor orchestrator logs for spans

### Method 3: Direct API Test

```powershell
# Watch logs in one terminal
docker-compose -f infra/docker-compose.dev.yml logs orchestrator --follow

# In another terminal, make API call
node test-cors-integration.js
```

## 📈 Key Telemetry Metrics

### Operations Tracked

1. **orchestrator.startRunWithDag**: Starting a workflow execution
   - Duration: How long to submit to engine
   - Attributes: runId, nodeCount
   - Success: Whether submission succeeded

2. **orchestrator.pollOnce**: Polling run status
   - Duration: How long to check engine status
   - Attributes: runId, engineRunId
   - Success: Whether polling succeeded

### Performance Insights

From the last test run:

- **Start Operation**: 1,225ms (workflow submission to engine)
- **Poll Operation**: 4ms (very fast status check)
- **Total Flow**: Start → Execute → Poll → Complete

### Error Tracking

If operations fail, you'll see:

```json
{
  "msg": "span.error",
  "traceId": "...",
  "spanId": "...",
  "operation": "orchestrator.startRunWithDag",
  "error": "Connection refused"
}
```

## 🔗 Trace Flow Example

A complete workflow execution creates this trace:

```
traceId: k7j6cd3sbx9
├── span: orchestrator.startRunWithDag (1,225ms) ✅
└── span: orchestrator.pollOnce (4ms) ✅

traceId: 8c6ftctsmfh
└── span: orchestrator.pollOnce (4ms) ✅
```

Each `traceId` groups related operations, and `spanId` identifies individual operations.

## 💡 Using Telemetry for Debugging

### Performance Issues

- Look for spans with high `duration` values
- Identify bottlenecks in the operation chain

### Error Investigation

- Find `span.error` entries
- Use `traceId` to see the full context
- Check `runId` to link to specific workflow

### System Health

- Monitor span success rates
- Track operation durations over time
- Identify failing components

## 🚀 Next Steps

This telemetry foundation can be extended with:

- **Metrics Collection**: Count operations, measure latencies
- **External Tracing**: Send to Jaeger/Zipkin for visualization
- **Alerting**: Trigger alerts on error rates or slow operations
- **Dashboards**: Build Grafana dashboards for monitoring

The current implementation provides all the structured data needed for these enhancements!
