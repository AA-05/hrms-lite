from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Automatically create database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 1. ADD CORS MIDDLEWARE (Crucial for Vercel and Local connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- EMPLOYEE ROUTES ---

# GET ALL EMPLOYEES (Fixes the "Still Loading" issue)
@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

# ADD NEW EMPLOYEE
@app.post("/employees")
def create_employee(employee: models.EmployeeCreate, db: Session = Depends(get_db)):
    # Check if ID already exists to prevent duplicate entries
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first()
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee with this ID already exists.")
    
    new_emp = models.Employee(**employee.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"message": "Employee added successfully!"}

# --- ATTENDANCE ROUTES ---

# GET ATTENDANCE HISTORY
@app.get("/attendance")
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()


# MARK ATTENDANCE
@app.post("/attendance")
def mark_attendance(attendance: models.AttendanceCreate, db: Session = Depends(get_db)):
    # Explicitly map 'emp_id' from the frontend to 'employee_id' in the database
    new_record = models.Attendance(
        employee_id=attendance.emp_id, 
        status=attendance.status
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return {"message": "Attendance recorded successfully!"}