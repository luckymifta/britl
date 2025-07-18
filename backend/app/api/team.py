from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin_user
from app.crud.team import team_member
from app.schemas.team import TeamMember, TeamMemberCreate, TeamMemberUpdate
from app.utils.file_upload import save_uploaded_image, delete_image_file
import os

router = APIRouter()


@router.get("/", response_model=List[TeamMember])
def get_team_members(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    order_by_position: bool = True
) -> Any:
    """
    Get all team members
    """
    return team_member.get_all_members(
        db=db, 
        skip=skip, 
        limit=limit, 
        active_only=active_only,
        order_by_position=order_by_position
    )


@router.get("/{member_id}", response_model=TeamMember)
def get_team_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
) -> Any:
    """
    Get team member by ID
    """
    member = team_member.get(db=db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )
    return member


@router.post("/", response_model=TeamMember)
def create_team_member(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    member_in: TeamMemberCreate,
) -> Any:
    """
    Create new team member
    """
    return team_member.create(db=db, obj_in=member_in)


@router.post("/with-image", response_model=TeamMember)
async def create_team_member_with_image(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    name: str = Form(...),
    position: str = Form(...),
    bio: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    linkedin_url: str = Form(None),
    twitter_url: str = Form(None),
    department: str = Form(None),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    image: UploadFile = File(None),
) -> Any:
    """
    Create team member with image upload
    """
    # Prepare team member data
    member_data = {
        "name": name,
        "position": position,
        "bio": bio,
        "email": email,
        "phone": phone,
        "linkedin_url": linkedin_url,
        "twitter_url": twitter_url,
        "department": department,
        "is_active": is_active,
        "order_position": order_position,
    }

    # Handle image upload
    if image and image.filename:
        image_filename = await save_uploaded_image(image, "team")
        member_data["image_url"] = f"/static/{image_filename}"

    # Remove None values
    member_data = {k: v for k, v in member_data.items() if v is not None}

    # Create team member
    member_create = TeamMemberCreate(**member_data)
    return team_member.create(db=db, obj_in=member_create)


@router.put("/{member_id}", response_model=TeamMember)
def update_team_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    member_in: TeamMemberUpdate,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Update team member
    """
    member = team_member.get(db=db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )
    return team_member.update(db=db, db_obj=member, obj_in=member_in)


@router.put("/{member_id}/with-image", response_model=TeamMember)
async def update_team_member_with_image(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: dict = Depends(get_current_admin_user),
    name: str = Form(None),
    position: str = Form(None),
    bio: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    linkedin_url: str = Form(None),
    twitter_url: str = Form(None),
    department: str = Form(None),
    is_active: bool = Form(None),
    order_position: int = Form(None),
    image: UploadFile = File(None),
) -> Any:
    """
    Update team member with image upload
    """
    # Get existing team member
    existing_member = team_member.get(db=db, id=member_id)
    if not existing_member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )

    # Prepare update data
    member_data = {
        "name": name,
        "position": position,
        "bio": bio,
        "email": email,
        "phone": phone,
        "linkedin_url": linkedin_url,
        "twitter_url": twitter_url,
        "department": department,
        "is_active": is_active,
        "order_position": order_position,
    }

    # Handle image upload
    if image and image.filename:
        # Delete old image if exists
        if existing_member.image_url is not None:
            delete_image_file(str(existing_member.image_url))
        
        image_filename = await save_uploaded_image(image, "team")
        member_data["image_url"] = f"/static/{image_filename}"

    # Remove None values
    member_data = {k: v for k, v in member_data.items() if v is not None}

    # Update team member
    member_update = TeamMemberUpdate(**member_data)
    return team_member.update(db=db, db_obj=existing_member, obj_in=member_update)


@router.delete("/{member_id}/image")
async def delete_team_member_image(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Delete team member image
    """
    member = team_member.get(db=db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )
    
    if member.image_url is not None:
        delete_image_file(str(member.image_url))
        team_member.update(db=db, db_obj=member, obj_in={"image_url": None})
    
    return {"message": "Image deleted successfully"}


@router.delete("/{member_id}")
def delete_team_member(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Delete team member
    """
    member = team_member.get(db=db, id=member_id)
    if not member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )
    
    # Delete associated image if exists
    if member.image_url is not None:
        delete_image_file(str(member.image_url))
    
    team_member.remove(db=db, id=member_id)
    return {"message": "Team member deleted successfully"}


@router.post("/reorder")
async def reorder_team_members(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    member_orders: List[dict],
) -> Any:
    """
    Update order positions for multiple team members
    """
    success = team_member.update_order_positions(db=db, member_orders=member_orders)
    if success:
        return {"message": "Team member order updated successfully"}
    else:
        raise HTTPException(
            status_code=400,
            detail="Failed to update team member order"
        )


@router.post("/{member_id}/toggle-status", response_model=TeamMember)
def toggle_member_status(
    *,
    db: Session = Depends(get_db),
    member_id: int,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Toggle active status of team member
    """
    member = team_member.toggle_active_status(db=db, member_id=member_id)
    if not member:
        raise HTTPException(
            status_code=404, 
            detail="Team member not found"
        )
    return member


@router.get("/department/{department}", response_model=List[TeamMember])
def get_team_members_by_department(
    *,
    db: Session = Depends(get_db),
    department: str,
) -> Any:
    """
    Get team members by department
    """
    return team_member.get_by_department(db=db, department=department)


@router.get("/stats/count")
def get_team_stats(
    *,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get team statistics
    """
    active_count = team_member.get_active_count(db=db)
    total_count = len(team_member.get_multi(db=db, limit=1000))
    
    return {
        "active_members": active_count,
        "total_members": total_count,
        "inactive_members": total_count - active_count
    }
