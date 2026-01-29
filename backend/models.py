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

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Date, primary_key=True, default=datetime.date.today) # Simplified ID for logs
    employee_id = Column(String)
    date = Column(String, default=lambda: str(datetime.date.today()))
    status = Column(String)

# Pydantic Schemas
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str

class AttendanceCreate(BaseModel):
    employee_id: str
    status: str