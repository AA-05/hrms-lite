import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Building } from 'lucide-react';

// Your verified Backend URL
const API = "https://hrms-lite-backend-0e5l.onrender.com";

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
      alert(res.data.message); 
      setFormData({ emp_id: '', name: '', email: '', dept: '' });
      fetchAllData();
    } catch (err) { 
      alert(err.response?.data?.detail || "Error adding employee."); 
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!attData.emp_id) return alert("Please select an employee.");
    try {
      const payload = {
        employee_id: attData.emp_id,
        status: attData.status
      };
      await axios.post(`${API}/attendance`, payload);
      alert("Attendance recorded!");
      fetchAllData();
    } catch (err) { 
      alert("Failed to mark attendance."); 
    }
  };

  const filteredAttendance = useMemo(() => {
    return dateFilter ? attendance.filter(record => record.date === dateFilter) : attendance;
  }, [attendance, dateFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b p-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Briefcase /> <span>HRMS Lite</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setView('employees')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            Employees
          </button>
          <button onClick={() => setView('attendance')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
            Attendance
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'employees' ? (
          <div className="space-y-6">
            <form onSubmit={handleAddEmployee} className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-5 gap-3">
              <input placeholder="ID" className="border p-2 rounded" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
              <input placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Email" type="email" className="border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input placeholder="Dept" className="border p-2 rounded" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
              <button className="bg-indigo-600 text-white rounded font-bold">Add</button>
            </form>
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-slate-400 text-xs uppercase font-bold">
                    <th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Dept</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map(emp => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono">{emp.employee_id}</td>
                      <td className="p-4 font-bold">{emp.full_name}</td>
                      <td className="p-4 text-slate-600">{emp.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border rounded-xl h-fit shadow-sm">
              <h2 className="font-bold mb-4">Mark Status</h2>
              <form onSubmit={markAttendance} className="space-y-4">
                <select className="border w-full p-2 rounded" onChange={e => setAttData({...attData, emp_id: e.target.value})} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAttData({...attData, status: 'Present'})} className={`flex-1 p-2 border rounded ${attData.status === 'Present' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : ''}`}>Present</button>
                  <button type="button" onClick={() => setAttData({...attData, status: 'Absent'})} className={`flex-1 p-2 border rounded ${attData.status === 'Absent' ? 'bg-rose-50 border-rose-600 text-rose-600' : ''}`}>Absent</button>
                </div>
                <button className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold">Submit</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold">History</h3>
                <input type="date" className="border p-1 rounded text-sm" onChange={e => setDateFilter(e.target.value)} />
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
                  <tr><th className="p-4">ID</th><th className="p-4">Date</th><th className="p-4">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAttendance.map((r, i) => (
                    <tr key={i}>
                      <td className="p-4 font-semibold">{r.employee_id}</td>
                      <td className="p-4 text-slate-500">{r.date}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {r.status}
                        </span>
                      </td>
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