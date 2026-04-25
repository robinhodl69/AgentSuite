from __future__ import annotations

import os

import uvicorn


def main() -> None:
    uvicorn.run(
        "agentsuite_agent.api:create_app",
        factory=True,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )

