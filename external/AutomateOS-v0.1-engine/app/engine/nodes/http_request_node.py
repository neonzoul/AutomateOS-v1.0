from __future__ import annotations
"""HTTP request node with structured JSON logging and naive masking of basic-auth in URL.

Pyright relaxed via directives for this prototype.
"""
# pyright: reportMissingImports=false, reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from typing import Any, Dict
import json, time

import httpx  # type: ignore  # [[modern and easy-to-use HTTP client library.]]

from app.engine.nodes.base import BaseNode


class HttpRequestNode(BaseNode):
    """HTTP request node.

    Notes:
    - Does NOT raise for non-2xx responses; returns status_code, headers, json, text.
      This lets a downstream FilterNode decide pass/fail.
    - Accepts config keys: url (required), method (default GET), headers/header, params, json_body.
    """

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Read the configuration for this node from the self.config dictionary.
        url = self.config.get("url")
        method = self.config.get("method", "GET").upper()
        headers = self.config.get("headers") or self.config.get("header", {})
        params = self.config.get("params", {})
        json_body = self.config.get("json_body", {})

        if not url:
            print("HTTP Request Error: Error - URL is not defined in the config.")
            raise ValueError("URL is required for HttpRequestNode")

        start = time.time()
        # Mask basic auth tokens in URL if present (very naive)
        safe_url = url
        if "@" in url and "://" in url:
            try:
                scheme, rest = url.split("://", 1)
                _, hostpart = rest.split("@", 1)
                safe_url = f"{scheme}://***:***@{hostpart}"
            except Exception:
                safe_url = url
        print(json.dumps({
            "event": "node.http.execute",
            "url": safe_url,
            "method": method,
        }))

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json_body,
                )

                # Prepare the output data for the next node.
                try:
                    response_json: Any = response.json()
                except ValueError:
                    response_json = None

                output: Dict[str, Any] = {
                    "status_code": int(response.status_code),
                    "headers": dict(response.headers),
                    "json": response_json,
                    "text": response.text,
                }

                print(json.dumps({
                    "event": "node.http.complete",
                    "url": safe_url,
                    "method": method,
                    "status": int(response.status_code),
                    "durationMs": int((time.time() - start) * 1000),
                }))
                return output

        except httpx.RequestError as e:
            # network / timeout / connection error
            print(json.dumps({
                "event": "node.http.error",
                "url": safe_url,
                "method": method,
                "error": str(e),
                "durationMs": int((time.time() - start) * 1000),
            }))
            raise


