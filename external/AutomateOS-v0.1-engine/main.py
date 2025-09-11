# :Modules: FastAPI Application Entrypoint

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, APIRouter, HTTPException
from fastapi.responses import Response
from typing import Dict, Any, Callable, Awaitable, Optional, List, cast
import time, json, uuid

from app.db.session import create_db_and_tables
from app.api.v1.endpoints import auth, workflows, webhooks


# === Lifespan (startup/shutdown) ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Automate OS Engine...")
    create_db_and_tables()
    print("Database tables created successfully")
    print("🕹️  API Documentation: http://127.0.0.1:8000/docs")
    print("🕳️  Alternative docs: http://127.0.0.1:8000/redoc")
    
    yield
    
    # SHUTDOWN
    print("Shutting down Automate OS Engine...")
    # [[Add any cleanup code here -- For example: close database connections, cleanup resources, etc.]]
    print("Cleanup completed") # [[ needed ?]]
    
# === FastAPI Application Setup ===
app = FastAPI(
    title="AutomateOS (Engine)",
    version="0.2.0",
    lifespan=lifespan,
)

SENSITIVE_HEADER_KEYS = {"authorization", "x-api-key", "api-key", "x-auth-token"}

def mask_value(v: str) -> str:
    if not v:
        return v
    if len(v) <= 6:
        return "*" * len(v)
    return v[:3] + "***" + v[-2:]

def mask_headers(headers: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k, v in headers.items():
        if k.lower() in SENSITIVE_HEADER_KEYS:
            out[k] = mask_value(str(v))
        else:
            out[k] = v
    return out

def log_event(event: str, **fields: Any) -> None:
    rec: Dict[str, Any] = {"ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), "event": event, **fields}
    print(json.dumps(rec, ensure_ascii=False))

@app.middleware("http")
async def add_request_context(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    start = time.time()
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    run_id = request.headers.get("x-run-id") or None
    log_event(
        "request.in",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        headers=mask_headers(dict(request.headers)),
        runId=run_id,
    )
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    log_event(
        "request.out",
        requestId=request_id,
        method=request.method,
        path=request.url.path,
        statusCode=response.status_code,
        durationMs=duration_ms,
        runId=run_id,
    )
    return response

# === Root Endpoint ===
@app.get("/")
def read_root():
    return {"message": "AutomateOS Engine is running"}

# === In-memory run store (prototype) ===
runs: Dict[str, Dict[str, Any]] = {}

def _new_run_record(engine_run_id: str, run_id: Optional[str], dag: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": engine_run_id,
        "externalRunId": run_id,
        "status": "queued",
        "steps": [],
        "logs": [],
        "dag": dag,
        "createdAt": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }

engine_router = APIRouter(prefix="/v1")

@engine_router.post("/execute")
async def execute(payload: Dict[str, Any]) -> Dict[str, str]:
    engine_run_id = "eng_" + str(uuid.uuid4())
    run_id = payload.get("runId")
    dag: Dict[str, Any] = payload.get("dag", {}) or {}
    rec = _new_run_record(engine_run_id, run_id, dag)
    runs[engine_run_id] = rec
    log_event("engine.execute.accepted", engineRunId=engine_run_id, runId=run_id)
    # naive synchronous execution (sequential) for MVP
    try:
        import httpx  # type: ignore
        rec["status"] = "running"
        steps: List[Dict[str, Any]] = dag.get("nodes", []) or []
        for idx, step in enumerate(steps):
            step_dict: Dict[str, Any] = step
            step_id = step_dict.get("id") or f"s{idx+1}"
            step_type = step_dict.get("type") or "unknown"
            started = time.time()
            rec["logs"].append({"ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), "level": "info", "msg": f"step {step_id} start {step_type}"})
            status = "succeeded"
            # HTTP node execution: support both legacy 'http_request_node' and current UI 'http'
            if step_type in ("http_request_node", "http"):
                cfg: Dict[str, Any] = step_dict.get("config", {}) or {}
                url = cfg.get("url") or "https://httpbin.org/get"
                method = str(cfg.get("method") or "GET").upper()
                headers: Dict[str, Any] = cfg.get("headers") or {}
                # Accept body in either 'json_body' (legacy) or 'body' (current UI textarea)
                body_raw = cfg.get("json_body") or cfg.get("body") or None
                json_body: Optional[Dict[str, Any]] = None
                text_body: Optional[str] = None
                if body_raw is not None:
                    if isinstance(body_raw, dict):
                        json_body = cast(Dict[str, Any], body_raw)
                    elif isinstance(body_raw, str):
                        # Try to parse as JSON; if fails treat as plain text
                        try:
                            parsed_obj = json.loads(body_raw)
                            if isinstance(parsed_obj, dict):
                                json_body = parsed_obj  # type: ignore[arg-type]
                            else:
                                text_body = body_raw
                        except Exception:  # pragma: no cover - best effort only
                            text_body = body_raw
                req_started = time.time()
                try:
                    with httpx.Client(timeout=15.0) as client:
                        resp = client.request(
                            method=method,
                            url=str(url),
                            headers=headers,
                            json=json_body,
                            content=text_body,
                        )
                    req_duration = int((time.time() - req_started) * 1000)
                    # Request body info (if any)
                    if json_body is not None or text_body is not None:
                        sent_desc = (
                            f"json keys={list(json_body.keys())[:5]}" if json_body else f"text {len(text_body or '')} chars"
                        )
                        rec["logs"].append({
                            "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                            "level": "info",
                            "msg": f"http request body sent: {sent_desc}"
                        })
                    # Response summary line with method + duration + content type
                    resp_ct = resp.headers.get("content-type", "?")
                    rec["logs"].append({
                        "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "level": "info",
                        "msg": f"http {method} {resp.status_code} {url} {req_duration}ms ct={resp_ct}"
                    })
                    # Response payload (best effort)
                    body_logged = False
                    if resp_ct.startswith("application/json"):
                        try:
                            response_data = resp.json()
                            serialized = json.dumps(response_data)
                            if len(serialized) > 800:
                                rec["logs"].append({
                                    "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                    "level": "info",
                                    "msg": f"Response(JSON,truncated): {serialized[:800]}..."
                                })
                            else:
                                rec["logs"].append({
                                    "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                    "level": "info",
                                    "msg": f"Response(JSON): {response_data}"
                                })
                            body_logged = True
                        except Exception as je:  # pragma: no cover
                            rec["logs"].append({
                                "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                "level": "error",
                                "msg": f"response json parse error: {je}"
                            })
                    if not body_logged:
                        txt = resp.text
                        if not txt:
                            rec["logs"].append({
                                "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                "level": "info",
                                "msg": "Response: <empty>"
                            })
                        else:
                            truncated = txt[:800] + "..." if len(txt) > 800 else txt
                            rec["logs"].append({
                                "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                "level": "info",
                                "msg": f"Response(Text): {truncated}"
                            })
                except Exception as he:  # pragma: no cover
                    status = "failed"
                    rec["logs"].append({
                        "ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        "level": "error",
                        "msg": f"http error {method} {url}: {he}"
                    })
            duration = int((time.time() - started) * 1000)
            rec["steps"].append({"id": step_id, "status": status, "durationMs": duration})
            rec["logs"].append({"ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), "level": "info", "msg": f"step {step_id} done"})
            if status == "failed":
                rec["status"] = "failed"
                break
        if rec["status"] != "failed":
            rec["status"] = "succeeded"
    except Exception as e:  # pragma: no cover
        rec["status"] = "failed"
        rec["logs"].append({"ts": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), "level": "error", "msg": f"execution failed: {e}"})
    return {"engineRunId": engine_run_id}

@engine_router.get("/runs/{engine_run_id}")
async def get_run(engine_run_id: str):
    rec = runs.get(engine_run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="not_found")
    return {
        "id": rec["id"],
        "status": rec["status"],
        "steps": rec["steps"],
        "logs": rec["logs"],
    }

app.include_router(engine_router)

# === Endpoints Router ===

# -- Autentication --
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
# [[ Include authentication router with API versioning ]]
# [[ All auth endpoints will be available under /api/v1/* prefix ]]

# -- Workflows --
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["Workflows"])

# -- Webhooks --
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])

