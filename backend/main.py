from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal
import datetime

# This creates tables ONLY if the .db file is brand new
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard dependency to ensure DB sessions close properly
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {
        "message": "HRMS API is Running",
        "endpoints": ["/employees", "/attendance"],
        "docs": "/docs"
    }

@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/employees")
def create_employee(employee: models.EmployeeCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Employee ID already exists.")
    new_emp = models.Employee(**employee.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"message": "Employee added successfully!"}

@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: str, db: Session = Depends(get_db)):
    db.query(models.Employee).filter(models.Employee.employee_id == emp_id).delete()
    db.commit()
    return {"message": "Deleted"}

@app.get("/attendance")
def get_attendance(db: Session = Depends(get_db)):
    # This GET request was failing with 500 because the table was missing
    return db.query(models.Attendance).all()

@app.post("/attendance")
def mark_attendance(att: models.AttendanceCreate, db: Session = Depends(get_db)):
    try:
        new_att = models.Attendance(**att.dict())
        db.add(new_att)
        db.commit()
        db.refresh(new_att)
        return {"message": "Attendance recorded!"}
    except Exception as e:
        db.rollback()
        # This will reveal the specific SQLite error in your browser console
        raise HTTPException(status_code=500, detail=str(e))