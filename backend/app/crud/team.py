from typing import List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.crud.base import CRUDBase
from app.models.team import TeamMember
from app.schemas.team import TeamMemberCreate, TeamMemberUpdate


class CRUDTeamMember(CRUDBase[TeamMember, TeamMemberCreate, TeamMemberUpdate]):
    def get_all_members(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        active_only: bool = True,
        order_by_position: bool = True
    ) -> List[TeamMember]:
        """Get all team members with optional filtering and ordering"""
        query = db.query(TeamMember)
        
        if active_only:
            query = query.filter(TeamMember.is_active == True)
        
        if order_by_position:
            query = query.order_by(asc(TeamMember.order_position), asc(TeamMember.name))
        else:
            query = query.order_by(desc(TeamMember.created_at))
        
        return query.offset(skip).limit(limit).all()

    def get_active_members(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[TeamMember]:
        """Get active team members for public display"""
        return db.query(TeamMember).filter(
            TeamMember.is_active == True
        ).order_by(asc(TeamMember.order_position), asc(TeamMember.name)).offset(skip).limit(limit).all()

    def get_by_department(self, db: Session, department: str) -> List[TeamMember]:
        """Get team members by department"""
        return db.query(TeamMember).filter(
            TeamMember.department == department,
            TeamMember.is_active == True
        ).order_by(asc(TeamMember.order_position)).all()

    def get_active_count(self, db: Session) -> int:
        """Get count of active team members"""
        return db.query(TeamMember).filter(TeamMember.is_active == True).count()

    def update_order_positions(self, db: Session, member_orders: List[dict]) -> bool:
        """Update order positions for multiple team members"""
        try:
            for item in member_orders:
                member_id = item.get("id")
                new_position = item.get("order_position")
                
                if member_id and new_position is not None:
                    db.query(TeamMember).filter(TeamMember.id == member_id).update(
                        {"order_position": new_position}
                    )
            
            db.commit()
            return True
        except Exception:
            db.rollback()
            return False

    def toggle_active_status(self, db: Session, member_id: int) -> Optional[TeamMember]:
        """Toggle the active status of a team member"""
        member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
        if member:
            # Get current status and toggle it
            new_status = not bool(member.is_active)
            db.query(TeamMember).filter(TeamMember.id == member_id).update(
                {"is_active": new_status}
            )
            db.commit()
            db.refresh(member)
            return member
        return None


team_member = CRUDTeamMember(TeamMember)
