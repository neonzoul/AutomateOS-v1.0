#!/usr/bin/env python3
"""
Test the Stripe → Discord Bridge example from Sprint2 Implementation docs.

This simulates the workflow described in section 10 of Sprint2-Implementation.md
using the real Discord webhook URL provided by the user.
"""
from typing import Any, Dict
import requests
import json
import time

GATEWAY = 'http://localhost:8080'
DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1415550898481922078/aJjQcw7TN1LlwTT0oWf9Ub_Fmq26NG46X56MxBjsHEB45ciTY_Qww7OY1zOyajyi7_sy'

def create_stripe_discord_workflow() -> Dict[str, Any]:
    """Create the Stripe → Discord Bridge workflow as described in Sprint2 docs"""
    return {
        "nodes": [
            {
                "id": "start", 
                "type": "start", 
                "position": {"x": 0, "y": 0}, 
                "data": {"config": {}}
            },
            {
                "id": "discord_notify", 
                "type": "http", 
                "position": {"x": 200, "y": 0}, 
                "data": {
                    "config": {
                        "method": "POST",
                        "url": DISCORD_WEBHOOK,
                        "headers": {"Content-Type": "application/json"},
                        "body": json.dumps({
                            "content": "🎉 New Sale! A payment of $10.00 was just successfully processed."
                        })
                    }
                }
            }
        ],
        "edges": [
            {"id": "e1", "source": "start", "target": "discord_notify"}
        ]
    }

def test_stripe_discord_bridge():
    """Test the complete Stripe → Discord workflow"""
    print("🚀 Testing Stripe → Discord Bridge Workflow")
    print("=" * 60)
    print(f"Discord Webhook: {DISCORD_WEBHOOK}")
    print()
    
    # Create workflow
    workflow = create_stripe_discord_workflow()
    
    try:
        # Start the run via Gateway (same as Builder UI)
        print("📤 Starting workflow run...")
        run_resp = requests.post(
            f'{GATEWAY}/v1/runs', 
            json={'graph': workflow}, 
            timeout=10
        )
        
        if run_resp.status_code != 201:
            print(f"❌ Failed to start run: {run_resp.status_code}")
            print(f"Response: {run_resp.text}")
            return False
            
        run_id = run_resp.json()['runId']
        print(f"✅ Run started: {run_id}")
        
        # Poll for completion
        print("⏳ Polling for completion...")
        status_resp = None
        for attempt in range(20):  # More time for Discord webhook
            time.sleep(1)
            status_resp = requests.get(f'{GATEWAY}/v1/runs/{run_id}', timeout=10)
            
            if status_resp.status_code != 200:
                print(f"   Poll {attempt + 1}: Status check failed")
                continue
                
            run_data = status_resp.json()
            status = run_data.get('status', 'unknown')
            print(f"   Poll {attempt + 1}: {status}")
            
            if status in ['succeeded', 'failed']:
                break
        
        # Final results
        print("\n" + "=" * 60)
        print("📋 FINAL RESULTS:")
        
        if status_resp and status_resp.status_code == 200:
            final_data = status_resp.json()
            final_status = final_data.get('status', 'unknown')
            logs = final_data.get('logs', [])
            
            print(f"Status: {final_status}")
            print(f"Logs: {len(logs)} entries")
            
            # Show key logs
            for log in logs:
                msg = log.get('msg', '')
                if 'http POST' in msg or 'Response(' in msg or 'discord' in msg.lower():
                    print(f"  📝 {msg}")
            
            if final_status == 'succeeded':
                print("\n🎉 SUCCESS! Check your Discord channel for the message:")
                print("   '🎉 New Sale! A payment of $10.00 was just successfully processed.'")
                return True
            else:
                print(f"\n❌ FAILED: {final_status}")
                return False
        else:
            status_code = status_resp.status_code if status_resp else "No response"
            print(f"❌ Failed to get final status: {status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("Discord Webhook Test - Sprint2 Implementation Example")
    print("This tests the workflow described in Sprint2-Implementation.md section 10")
    print()
    
    success = test_stripe_discord_bridge()
    
    if success:
        print("\n✅ Stripe → Discord Bridge workflow test PASSED!")
        print("   The Sprint2 implementation successfully executed the example workflow.")
    else:
        print("\n❌ Test FAILED - check logs above for details")
    
    exit(0 if success else 1)
