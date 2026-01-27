from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List
import models, database


app = FastAPI()

# Enable CORS for Vercel/Localhost connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hrms-lite-peach.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Validation Schemas
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class EmployeeOut(EmployeeCreate):
    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    emp_id: str
    status: str


class AttendanceOut(BaseModel):
    employee_id: str
    date: datetime
    status: str

    class Config:
        from_attributes = True


# --- Endpoints ---

@app.post("/employees", status_code=status.HTTP_201_CREATED)
def add_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    if db.query(models.Employee).filter(models.Employee.employee_id == emp.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists.")

    new_emp = models.Employee(**emp.dict())
    db.add(new_emp)
    db.commit()
    return {"message": "Employee added successfully!"}

@app.get("/employees", response_model=List[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()



@app.post("/attendance")
def mark_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    if not db.query(models.Employee).filter(models.Employee.employee_id == att.emp_id).first():
        raise HTTPException(status_code=404, detail="Employee ID not found.")

    new_att = models.Attendance(
        employee_id=att.emp_id,
        date=datetime.now(),
        status=att.status
    )
    db.add(new_att)
    db.commit()
    return {"message": f"Attendance marked as {att.status}"}


@app.get("/attendance", response_model=List[AttendanceOut])
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()
