"""Dev smoke test for Engine HTTP node execution.

Run inside repo (engine must be up):
  python external/AutomateOS-v0.1-engine/dev-smoke-http.py

It will POST a mini DAG for each HTTP method and print condensed log lines.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
import requests, time, json, sys

ENGINE = 'http://localhost:8081'

METHODS: List[Tuple[str, str, Optional[Dict[str, Any]]]] = [
    ('GET', 'https://httpbin.org/get', None),
    ('POST', 'https://jsonplaceholder.typicode.com/posts', {"title": "foo", "body": "bar", "userId": 1}),
    ('PUT', 'https://httpbin.org/put', {"x": 1}),
    ('PATCH', 'https://httpbin.org/patch', {"y": 2}),
    ('DELETE', 'https://httpbin.org/delete', None),
]

def run(method: str, url: str, body: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    dag: Dict[str, Any] = {
        "nodes": [
            {"id": "start", "type": "start", "config": {}},
            {"id": f"node_{method.lower()}", "type": "http", "config": {"method": method, "url": url, "body": json.dumps(body) if body is not None else None}},
        ]
    }
    r = requests.post(f"{ENGINE}/v1/execute", json={"runId": f"dev_{method.lower()}_{int(time.time())}", "dag": dag})
    r.raise_for_status()
    eng_id = r.json()["engineRunId"]
    # poll
    for _ in range(15):
        time.sleep(0.4)
        rs = requests.get(f"{ENGINE}/v1/runs/{eng_id}")
        rs.raise_for_status()
        data = rs.json()
        if data["status"] in ("succeeded", "failed"):
            return data
    raise RuntimeError("timeout waiting for run")

if __name__ == '__main__':
    failures = 0
    for method, url, body in METHODS:
        try:
            data = run(method, url, body)
            logs = data.get("logs", [])
            summary_line = next((l for l in logs if l['msg'].startswith(f'http {method} ')), None)
            print(f"{method}: {data['status']} :: {summary_line['msg'] if summary_line else 'no summary line'}")
        except Exception as e:
            failures += 1
            print(f"{method}: ERROR {e}", file=sys.stderr)
    if failures:
        sys.exit(1)
