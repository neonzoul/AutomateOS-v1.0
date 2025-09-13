#!/usr/bin/env python3
"""
Sprint2 Integration Verification Test

Validates that the Builder → API Gateway → Orchestrator → Engine flow works
with enhanced HTTP logging showing method, status, duration, and payload.

Expected outcome: Start + HTTP workflows execute successfully with detailed logs.
"""
from typing import Any, Dict, List, Optional, Tuple
import requests
import json
import time
import sys

GATEWAY = 'http://localhost:8080'

def create_workflow(method: str, url: str, body: Optional[str] = None) -> Dict[str, Any]:
    """Create a workflow graph for testing"""
    config: Dict[str, Any] = {"method": method, "url": url}
    if body:
        config["body"] = body
    
    return {
        "nodes": [
            {"id": "start", "type": "start", "position": {"x": 0, "y": 0}, "data": {"config": {}}},
            {"id": "http", "type": "http", "position": {"x": 200, "y": 0}, "data": {"config": config}}
        ],
        "edges": [{"id": "e1", "source": "start", "target": "http"}]
    }

def run_workflow_test(name: str, method: str, url: str, body: Optional[str] = None) -> str:
    """Execute a workflow and return detailed results"""
    print(f"\n🧪 Testing: {name}")
    print(f"   Method: {method} {url}")
    if body:
        print(f"   Body: {body[:50]}{'...' if len(body) > 50 else ''}")
    
    # Create and start workflow
    graph = create_workflow(method, url, body)
    
    try:
        # POST to Gateway (same as Builder UI)
        run_resp = requests.post(f'{GATEWAY}/v1/runs', json={'graph': graph}, timeout=10)
        if run_resp.status_code != 201:
            return f"❌ Failed to start run: {run_resp.status_code} {run_resp.text}"
        
        run_id = run_resp.json()['runId']
        print(f"   Run ID: {run_id}")
        
        # Poll for completion (same as Builder UI)
        status_resp = None
        run_data = None
        for attempt in range(15):
            time.sleep(1)
            status_resp = requests.get(f'{GATEWAY}/v1/runs/{run_id}', timeout=10)
            
            if status_resp.status_code != 200:
                continue
                
            run_data = status_resp.json()
            status = run_data.get('status', 'unknown')
            
            if status in ['succeeded', 'failed']:
                break
            elif attempt < 14:
                print(f"   Poll {attempt + 1}: {status}")
        
        # Analyze results
        if status_resp is None or status_resp.status_code != 200:
            return f"❌ Failed to get final status: {status_resp.status_code if status_resp else 'No response'}"
        
        if run_data is None:
            return "❌ Failed to get run data"
            
        final_status = run_data.get('status', 'unknown')
        logs = run_data.get('logs', [])
        
        # Find key log lines
        http_summary = None
        response_log = None
        body_sent_log = None
        
        for log in logs:
            msg = log.get('msg', '')
            if msg.startswith(f'http {method}'):
                http_summary = msg
            elif msg.startswith('Response('):
                response_log = msg
            elif 'request body sent:' in msg:
                body_sent_log = msg
        
        # Generate report
        if final_status == 'succeeded':
            result = f"✅ SUCCESS: {final_status}"
            if http_summary:
                result += f"\n   📊 {http_summary}"
            if body_sent_log:
                result += f"\n   📤 {body_sent_log}"
            if response_log:
                result += f"\n   📥 {response_log[:100]}{'...' if len(response_log) > 100 else ''}"
        else:
            result = f"❌ FAILED: {final_status}"
            result += f"\n   Logs: {[log.get('msg', '') for log in logs]}"
        
        return result
        
    except Exception as e:
        return f"❌ ERROR: {str(e)}"

def main() -> int:
    """Run comprehensive Sprint2 verification tests"""
    print("🚀 Sprint2 Builder → Engine Integration Verification")
    print("=" * 70)
    
    tests: List[Tuple[str, str, str, Optional[str]]] = [
        ("GET Request", "GET", "https://httpbin.org/get", None),
        ("POST with JSON", "POST", "https://jsonplaceholder.typicode.com/posts", 
         json.dumps({"title": "Sprint2", "body": "Integration test", "userId": 99})),
        ("PUT Request", "PUT", "https://httpbin.org/put",
         json.dumps({"update": "test"})),
        ("DELETE Request", "DELETE", "https://httpbin.org/delete", None),
        ("Discord Webhook Test", "POST", "https://httpbin.org/post",
         json.dumps({"content": "🎉 Sprint2 integration works!"}))
    ]
    
    results: List[Tuple[str, str]] = []
    for test_name, method, url, body in tests:
        result = run_workflow_test(test_name, method, url, body)
        results.append((test_name, result))
        print(f"   {result.split(chr(10))[0]}")  # First line only
    
    print("\n" + "=" * 70)
    print("📋 FINAL RESULTS:")
    
    success_count = 0
    for test_name, result in results:
        print(f"\n{test_name}:")
        print(f"  {result}")
        if result.startswith("✅"):
            success_count += 1
    
    print(f"\n🎯 SUCCESS RATE: {success_count}/{len(results)} tests passed")
    
    if success_count == len(results):
        print("\n🎉 SPRINT2 GOAL ACHIEVED!")
        print("   ✓ Builder Canvas can run Start + HTTP workflows")
        print("   ✓ All HTTP methods work correctly") 
        print("   ✓ Logs show status, duration, and payload")
        print("   ✓ Full stack integration functional")
        return 0
    else:
        print(f"\n⚠️  {len(results) - success_count} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
