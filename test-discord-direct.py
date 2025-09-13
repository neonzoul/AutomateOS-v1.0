#!/usr/bin/env python3
"""
Direct test of Discord webhook through Sprint2 pipeline
"""
from typing import Any, Dict
import requests
import json
import time

# Test Discord webhook through Sprint2 pipeline
GATEWAY = 'http://localhost:8080'
DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1415550898481922078/aJjQcw7TN1LlwTT0oWf9Ub_Fmq26NG46X56MxBjsHEB45ciTY_Qww7OY1zOyajyi7_sy'

print('🚀 Sprint2 Stripe → Discord Bridge Test')
print('Testing through Builder → Gateway → Orchestrator → Engine pipeline')
print()

# Create the exact workflow from Sprint2 docs
workflow: Dict[str, Any] = {
    'nodes': [
        {'id': 'start', 'type': 'start', 'position': {'x': 0, 'y': 0}, 'data': {'config': {}}},
        {'id': 'notify', 'type': 'http', 'position': {'x': 200, 'y': 0}, 'data': {'config': {
            'method': 'POST',
            'url': DISCORD_WEBHOOK,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'content': '🎉 Sprint2 Test: Stripe → Discord Bridge working! Payment of $10.00 processed.'})
        }}}
    ],
    'edges': [{'id': 'e1', 'source': 'start', 'target': 'notify'}]
}

# Start run
print('📤 Starting workflow through API Gateway...')
run_resp = requests.post(f'{GATEWAY}/v1/runs', json={'graph': workflow}, timeout=10)
print(f'Gateway Response: {run_resp.status_code}')

if run_resp.status_code == 201:
    run_id = run_resp.json()['runId']
    print(f'✅ Run ID: {run_id}')
    
    # Poll for completion
    print('⏳ Polling for completion...')
    final_data = None
    for i in range(15):
        time.sleep(1)
        status = requests.get(f'{GATEWAY}/v1/runs/{run_id}')
        if status.status_code == 200:
            data = status.json()
            current_status = data.get('status', 'unknown')
            print(f'   Poll {i+1}: {current_status}')
            if current_status in ['succeeded', 'failed']:
                final_data = data
                break
    
    print()
    print('📋 FINAL RESULTS:')
    if final_data:
        final_status = final_data.get('status')
        logs = final_data.get('logs', [])
        print(f'Status: {final_status}')
        print(f'Total logs: {len(logs)}')
        
        print('\nKey logs:')
        for log in logs:
            msg = log.get('msg', '')
            if any(keyword in msg.lower() for keyword in ['discord', 'webhook', 'http post', 'response']):
                print(f'  📝 {msg}')
        
        if final_status == 'succeeded':
            print('\n🎉 SUCCESS! Discord webhook executed successfully!')
            print('Check your Discord channel for the message:')
            print('   "🎉 Sprint2 Test: Stripe → Discord Bridge working! Payment of $10.00 processed."')
        else:
            print(f'\n❌ FAILED: {final_status}')
    else:
        print('❌ No final data received')
else:
    print(f'❌ Failed to start run: {run_resp.text}')
