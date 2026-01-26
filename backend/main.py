from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
# Import your models and database config
from database import SessionLocal, engine, Base
import models

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/employees")
def create_employee(employee: models.EmployeeCreate, db: Session = Depends(get_db)):
    # Check if ID already exists to avoid the 'Validation Error'
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first()
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee with this ID already exists.")
    
    new_emp = models.Employee(**employee.dict())
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return {"message": "Employee added successfully!"}