from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

# Auto-create database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# FIX: CORS allows your Vercel frontend to talk to this Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains for now to ensure connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "HRMS API is Live", "docs": "/docs"}

@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/employees")
def create_employee(employee: models.EmployeeCreate, db: Session = Depends(get_db)):
    # Check if ID already exists
    exists = db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Employee ID already exists.")
    
    new_emp = models.Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"message": "Employee added successfully!"}

@app.get("/attendance")
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()

@app.post("/attendance")
def mark_attendance(att: models.AttendanceCreate, db: Session = Depends(get_db)):
    new_att = models.Attendance(**att.dict())
    db.add(new_att)
    db.commit()
    return {"message": "Attendance recorded!"}