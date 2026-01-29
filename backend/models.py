from sqlalchemy import Column, String, Date
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
import datetime

Base = declarative_base()

# SQLAlchemy Models
class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String)
    department = Column(String)

# backend/models.py
# backend/models.py
class Attendance(Base):
    __tablename__ = "attendance"
    # An integer primary key is required for SQLite to manage the rows
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String, index=True)
    status = Column(String)
    date = Column(String, default=lambda: str(datetime.date.today()))

# Pydantic Schemas
# In backend/models.py
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str  # Using str is safer than EmailStr during initial setup
    department: str

# This is the "Brain" that validates the incoming data
class AttendanceCreate(BaseModel):
    employee_id: str  # Must match 'employee_id' in App.js
    status: str       # Must match 'status' in App.js