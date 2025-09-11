#!/usr/bin/env python3
"""
Direct engine test for Discord webhook
"""
from typing import Any, Dict
import requests
import json
import time

ENGINE = 'http://localhost:8081'
DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1415550898481922078/aJjQcw7TN1LlwTT0oWf9Ub_Fmq26NG46X56MxBjsHEB45ciTY_Qww7OY1zOyajyi7_sy'

print('🔧 Direct Engine Test - Discord Webhook')
print('Testing Engine HTTP node execution directly')
print()

# Build DAG exactly as orchestrator would
dag: Dict[str, Any] = {
    'nodes': [
        {'id': 'start', 'type': 'start', 'config': {}},
        {'id': 'discord', 'type': 'http', 'config': {
            'method': 'POST',
            'url': DISCORD_WEBHOOK,
            'body': json.dumps({'content': '🔧 Direct Engine Test: Discord webhook from Sprint2!'})
        }}
    ]
}

print(f'Discord URL: {DISCORD_WEBHOOK[:60]}...')
print(f'Message: Discord webhook from Sprint2!')
print()

# Call engine directly
print('📤 Calling engine directly...')
resp = requests.post(f'{ENGINE}/v1/execute', json={'runId': 'direct_test', 'dag': dag}, timeout=15)
print(f'Engine execute response: {resp.status_code}')

if resp.status_code == 200:
    engine_data = resp.json()
    engine_id = engine_data.get('engineRunId')
    print(f'✅ Engine run ID: {engine_id}')
    
    # Poll engine directly
    print('⏳ Polling engine status...')
    for i in range(10):
        time.sleep(1)
        status = requests.get(f'{ENGINE}/v1/runs/{engine_id}')
        if status.status_code == 200:
            data = status.json()
            current_status = data.get('status')
            print(f'   Poll {i+1}: {current_status}')
            if current_status in ['succeeded', 'failed']:
                logs = data.get('logs', [])
                print()
                print('📋 FINAL RESULTS:')
                print(f'Status: {current_status}')
                print(f'Total logs: {len(logs)}')
                print('Logs:')
                for log in logs:
                    print(f'  📝 {log.get("msg", "")}')
                
                if current_status == 'succeeded':
                    print('\n🎉 SUCCESS! Check Discord for message!')
                break
        else:
            print(f'   Poll {i+1}: Status check failed ({status.status_code})')
else:
    print(f'❌ Failed: {resp.status_code} - {resp.text}')
