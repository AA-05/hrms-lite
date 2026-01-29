from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

# Recreate tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

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
    return {"message": "Success!"}

@app.get("/attendance")
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).all()

@app.post("/attendance")
def mark_attendance(att: models.AttendanceCreate, db: Session = Depends(get_db)):
    try:
        new_att = models.Attendance(**att.dict())
        db.add(new_att)
        db.commit()
        return {"message": "Recorded!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))