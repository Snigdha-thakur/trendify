from fastapi import APIRouter, WebSocket, status
from app.core.security import decode_token
from typing import List
import json

router = APIRouter(prefix="/api/realtime", tags=["Realtime"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: int, message: dict):
        for conn in self.active_connections.get(user_id, []):
            try:
                await conn.send_json(message)
            except Exception:
                pass

    async def broadcast_to_all(self, message: dict):
        for conns in self.active_connections.values():
            for conn in conns:
                try:
                    await conn.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = int(payload["sub"])
    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except Exception:
        pass
    finally:
        await manager.disconnect(user_id, websocket)
