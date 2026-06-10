from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Course, Lesson, Enrollment
from app.schemas.schemas import CourseCreate, CourseUpdate, CourseResponse, LessonCreate, LessonResponse
from app.api.routes.users import get_current_user

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.post("/create", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new course"""
    # Only instructors (creators) can create courses
    if not current_user.is_creator and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can create courses"
        )
    
    course = Course(
        instructor_id=current_user.id,
        title=course_data.title,
        description=course_data.description,
        price=course_data.price,
        duration_hours=course_data.duration_hours
    )
    
    db.add(course)
    db.commit()
    db.refresh(course)
    
    return course

@router.get("/", response_model=list[CourseResponse])
def list_courses(
    skip: int = 0,
    limit: int = 10,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """List courses"""
    query = db.query(Course)
    
    if published_only:
        query = query.filter(Course.is_published == True)
    
    courses = query.offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get course details"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.instructor_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own courses"
        )
    
    if course_update.title:
        course.title = course_update.title
    if course_update.description:
        course.description = course_update.description
    if course_update.price is not None:
        course.price = course_update.price
    if course_update.duration_hours:
        course.duration_hours = course_update.duration_hours
    if course_update.is_published is not None:
        course.is_published = course_update.is_published
    
    db.commit()
    db.refresh(course)
    
    return course

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.instructor_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own courses"
        )
    
    db.delete(course)
    db.commit()
    
    return {"message": "Course deleted successfully"}

# Lessons
@router.post("/{course_id}/lessons", response_model=LessonResponse)
def create_lesson(
    course_id: int,
    lesson_data: LessonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lesson in course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.instructor_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add lessons to your own courses"
        )
    
    lesson = Lesson(
        course_id=course_id,
        title=lesson_data.title,
        content=lesson_data.content,
        video_url=lesson_data.video_url,
        order=lesson_data.order,
        duration_minutes=lesson_data.duration_minutes
    )
    
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    
    return lesson

@router.get("/{course_id}/lessons")
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    """Get all lessons in a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    return lessons

# Enrollment
@router.post("/{course_id}/enroll")
def enroll_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll in a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id
    )
    
    course.student_count += 1
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    
    return {"message": "Enrolled successfully", "enrollment_id": enrollment.id}

@router.get("/{course_id}/enrolled-courses")
def get_enrolled_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all enrolled courses for current user"""
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    
    courses = [enrollment.course for enrollment in enrollments]
    return courses
