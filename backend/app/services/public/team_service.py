"""
Public Team Service
Handles public-facing team member operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, asc
from app.models.team import TeamMember


class PublicTeamService:
    """Service for public team member operations"""
    
    @staticmethod
    def get_active_members(
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[TeamMember]:
        """
        Get active team members for public display
        Only returns members that are:
        - Active (is_active = True)
        - Ordered by position and name
        """
        return db.query(TeamMember).filter(
            TeamMember.is_active == True
        ).order_by(
            asc(TeamMember.order_position), 
            asc(TeamMember.name)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_member_by_id(db: Session, member_id: int) -> Optional[TeamMember]:
        """
        Get a specific active team member by ID for public display
        Returns None if member is not active or doesn't exist
        """
        return db.query(TeamMember).filter(
            and_(
                TeamMember.id == member_id,
                TeamMember.is_active == True
            )
        ).first()
    
    @staticmethod
    def get_members_by_department(
        db: Session, 
        department: str,
        skip: int = 0, 
        limit: int = 50
    ) -> List[TeamMember]:
        """
        Get active team members by department for public display
        """
        return db.query(TeamMember).filter(
            and_(
                TeamMember.department == department,
                TeamMember.is_active == True
            )
        ).order_by(
            asc(TeamMember.order_position)
        ).offset(skip).limit(limit).all()
