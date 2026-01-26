from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from database import Base
import datetime

# --- DATABASE MODELS (SQLAlchemy) ---
# Defines how data is stored in hrms.db
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String)
    department = Column(String)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"))
    date = Column(Date, default=datetime.date.today)
    status = Column(String)

# --- VALIDATION SCHEMAS (Pydantic) ---
# These prevent the "AttributeError" and handle frontend data

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str

    class Config:
        orm_mode = True

# Added for the Attendance feature
class AttendanceCreate(BaseModel):
    emp_id: str  # Matches the 'emp_id' key from your App.js state
    status: str

    class Config:
        orm_mode = True