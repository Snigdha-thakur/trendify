from fastapi import APIRouter, WebSocket, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import User, Notification
from typing import List
import json

router = APIRouter(prefix="/api/realtime", tags=["Realtime"])

# Store active connections
active_connections: dict = {}

class ConnectionManager:
    """Manage WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Connect a user"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    async def disconnect(self, user_id: int, websocket: WebSocket):
        """Disconnect a user"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if len(self.active_connections[user_id]) == 0:
                del self.active_connections[user_id]
    
    async def broadcast_to_user(self, user_id: int, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message: {e}")
    
    async def broadcast_to_all(self, message: dict):
        """Send message to all connected users"""
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time updates"""
    
    # Verify token
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif message.get("type") == "notification":
                # Broadcast notification to user
                await manager.broadcast_to_user(user_id, {
                    "type": "notification",
                    "data": message.get("data")
                })
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    
    finally:
        await manager.disconnect(user_id, websocket)

# Notification routes
@router.get("/notifications")
def get_notifications(
    user_id: int,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get notifications for a user"""
    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "notifications": notifications
    }

@router.post("/notifications/{notification_id}/mark-read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.post("/notifications/mark-all-read")
def mark_all_notifications_read(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}
