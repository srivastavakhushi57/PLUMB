from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database import get_db
from backend.app.models import Profile, Organization
from backend.app.schemas import Token, LoginRequest, RoleSwitchRequest, ProfileOut
from backend.app.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.email == req.email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id, "role": user.role, "org_id": user.org_id})
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_external=user.is_external,
        org_id=user.org_id
    )

@router.get("/me", response_model=ProfileOut)
async def get_me(current_user: Profile = Depends(get_current_user)):
    return current_user

@router.post("/switch-role", response_model=Token)
async def switch_role(
    req: RoleSwitchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Demo Mode utility: Allows switching active role instantly between
    admin, creator, reviewer, or external agency creator to test RBAC and flows.
    """
    # Find matching user in the organization for this role & external setting
    result = await db.execute(
        select(Profile).where(
            Profile.org_id == current_user.org_id,
            Profile.role == req.role,
            Profile.is_external == req.is_external
        )
    )
    target_user = result.scalars().first()

    if not target_user:
        # Fall back to any user with that role
        result = await db.execute(
            select(Profile).where(
                Profile.org_id == current_user.org_id,
                Profile.role == req.role
            )
        )
        target_user = result.scalars().first()

    if not target_user:
        raise HTTPException(status_code=404, detail=f"No user found with role {req.role}")

    token = create_access_token(data={"sub": target_user.id, "role": target_user.role, "org_id": target_user.org_id})
    return Token(
        access_token=token,
        token_type="bearer",
        role=target_user.role,
        user_id=target_user.id,
        full_name=target_user.full_name,
        email=target_user.email,
        is_external=target_user.is_external,
        org_id=target_user.org_id
    )
