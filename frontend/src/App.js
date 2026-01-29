import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Building } from 'lucide-react';

// FIX: Automatically cleans the URL to prevent /employees/employees error
const BASE_URL = process.env.REACT_APP_API_URL || "https://hrms-lite-backend-0e5l.onrender.com";
const API = BASE_URL.replace(/\/$/, ""); 

function App() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [view, setView] = useState('employees');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ emp_id: '', name: '', email: '', dept: '' });
  const [attData, setAttData] = useState({ emp_id: '', status: 'Present' });
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API}/employees`),
        axios.get(`${API}/attendance`)
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
    } catch (err) { console.error("Fetch failed", err); }
    finally { setLoading(false); }
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
      alert(res.data.message);
      setFormData({ emp_id: '', name: '', email: '', dept: '' });
      fetchAllData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Error: ID exists or Email is invalid.");
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!attData.emp_id) return alert("Select an employee.");
    try {
      await axios.post(`${API}/attendance`, attData);
      alert("Attendance recorded!");
      fetchAllData();
    } catch (err) { alert("Failed to mark attendance."); }
  };

  const deleteEmp = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await axios.delete(`${API}/employees/${id}`);
        fetchAllData();
      } catch (err) { alert("Delete failed. Check attendance records."); }
    }
  };

  const filteredAttendance = useMemo(() => {
    return dateFilter ? attendance.filter(r => r.date === dateFilter) : attendance;
  }, [attendance, dateFilter]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b p-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2"><Briefcase className="text-indigo-600" /> <span className="font-bold text-xl">HRMS Lite</span></div>
        <div className="flex gap-2">
          <button onClick={() => setView('employees')} className={`px-4 py-2 rounded-lg ${view === 'employees' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Employees</button>
          <button onClick={() => setView('attendance')} className={`px-4 py-2 rounded-lg ${view === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Attendance</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'employees' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="font-bold mb-4">Add Employee</h2>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input placeholder="ID" className="border p-2 rounded" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
                <input placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Email" type="email" className="border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input placeholder="Dept" className="border p-2 rounded" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
                <button className="bg-indigo-600 text-white rounded font-bold">Add</button>
              </form>
            </div>
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50"><tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Dept</th><th className="p-4 text-right">Delete</th></tr></thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.employee_id} className="border-t">
                      <td className="p-4">{emp.employee_id}</td>
                      <td className="p-4">{emp.full_name}</td>
                      <td className="p-4">{emp.department}</td>
                      <td className="p-4 text-right"><button onClick={() => deleteEmp(emp.employee_id)}><Trash2 className="text-rose-500" size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border rounded-xl h-fit">
              <h2 className="font-bold mb-4">Mark Status</h2>
              <form onSubmit={markAttendance} className="space-y-4">
                <select className="border w-full p-2 rounded" onChange={e => setAttData({...attData, emp_id: e.target.value})} required>
                  <option value="">Choose Employee...</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAttData({...attData, status: 'Present'})} className={`flex-1 p-2 border rounded ${attData.status === 'Present' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : ''}`}>Present</button>
                  <button type="button" onClick={() => setAttData({...attData, status: 'Absent'})} className={`flex-1 p-2 border rounded ${attData.status === 'Absent' ? 'bg-rose-50 border-rose-600 text-rose-600' : ''}`}>Absent</button>
                </div>
                <button className="w-full bg-slate-900 text-white p-3 rounded-lg">Submit</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white border rounded-xl">
               <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold">History</h3>
                 <input type="date" className="border p-1 rounded" onChange={e => setDateFilter(e.target.value)} />
               </div>
               <table className="w-full text-left">
                 <thead><tr className="text-xs text-slate-400 uppercase"><th className="p-4">ID</th><th className="p-4">Date</th><th className="p-4">Status</th></tr></thead>
                 <tbody>
                    {filteredAttendance.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-4">{r.employee_id}</td>
                        <td className="p-4 text-slate-500">{r.date}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;