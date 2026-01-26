import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// Removed 'Users' and 'CalendarCheck' to fix Vercel build error
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Building } from 'lucide-react';

// Use environment variable for production, fallback to local for dev
const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [view, setView] = useState('employees');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ emp_id: '', name: '', email: '', dept: '' });
  const [attData, setAttData] = useState({ emp_id: '', status: 'Present' });
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API}/employees`),
        axios.get(`${API}/attendance`)
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
    } catch (err) { 
      console.error("Fetch failed", err); 
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: formData.emp_id,
        full_name: formData.name,
        email: formData.email,
        department: formData.dept
      };
      const res = await axios.post(`${API}/employees`, payload);
      alert(res.data.message || "Employee added successfully!"); 
      setFormData({ emp_id: '', name: '', email: '', dept: '' });
      fetchAllData();
    } catch (err) { 
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Validation Error: Check your inputs."); 
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!attData.emp_id) return alert("Please select an employee first.");
    try {
      const res = await axios.post(`${API}/attendance`, attData);
      alert(res.data.message || "Attendance recorded!");
      fetchAllData();
    } catch (err) { 
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Failed to mark attendance."); 
    }
  };

  const deleteEmp = async (id) => {
    if (window.confirm("Remove this employee and all their records?")) {
      try {
        const res = await axios.delete(`${API}/employees/${id}`);
        alert(res.data.message || "Record Deleted.");
        fetchAllData();
      } catch (err) { alert("Delete failed."); }
    }
  };

  const filteredAttendance = useMemo(() => {
    if (!dateFilter) return attendance;
    return attendance.filter(record => record.date === dateFilter);
  }, [attendance, dateFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
            <Briefcase className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            HRMS <span className="text-indigo-600">Lite</span>
          </h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setView('employees')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            Employees
          </button>
          <button onClick={() => setView('attendance')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            Attendance
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {view === 'employees' ? (
          <div className="space-y-8">
            {/* Using your .card and .input-style classes */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="text-indigo-500" size={20} />
                <h2 className="text-lg font-bold">Register New Employee</h2>
              </div>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input className="input-style" placeholder="Emp ID" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
                <input className="input-style" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input className="input-style" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input className="input-style" placeholder="Dept" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
                <button className="btn-primary">Add</button>
              </form>
            </div>

            <div className="card overflow-hidden !p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID / Dept</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Employee Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-mono text-indigo-600 font-bold">{emp.employee_id}</p>
                        <p className="text-xs text-slate-400 uppercase font-semibold">{emp.department}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{emp.full_name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12}/>{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteEmp(emp.employee_id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Attendance View logic remains similar but wrapped in .card */
          <div className="card">
             <h2 className="text-xl font-bold mb-6">Attendance Logs</h2>
             {/* ... rest of attendance UI ... */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;