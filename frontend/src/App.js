import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Search } from 'lucide-react';

// Dynamic API URL: Uses Vercel environment variable or local fallback
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
      // Parallel fetch to speed up initial load
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
      // Displays the specific backend validation error (e.g., "ID already exists")
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : "Validation Error: Ensure ID is unique and email is valid."); 
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
    if (window.confirm("Remove this employee?")) {
      try {
        await axios.delete(`${API}/employees/${id}`);
        fetchAllData();
      } catch (err) { 
        alert("Delete failed. Ensure backend supports deletion."); 
      }
    }
  };

  const filteredAttendance = useMemo(() => {
    if (!dateFilter) return attendance;
    return attendance.filter(record => record.date === dateFilter);
  }, [attendance, dateFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    presentToday: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'Present').length
  }), [employees, attendance]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold tracking-tight">HRMS <span className="text-indigo-600">Lite</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setView('employees')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Employees</button>
          <button onClick={() => setView('attendance')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Attendance</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'employees' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600"/> Register New Employee</h2>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="ID (e.g. 101)" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Dept" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
                <button className="bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Add</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Employee</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Contact</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map(emp => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{emp.full_name}</p>
                        <p className="text-xs text-indigo-600 font-mono">ID: {emp.employee_id} • {emp.department}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500"><Mail size={14} className="inline mr-1"/>{emp.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteEmp(emp.employee_id)} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><ClipboardList size={20} className="text-indigo-600"/> Mark Attendance</h2>
              <form onSubmit={markAttendance} className="space-y-4">
                <select className="w-full border p-2 rounded-lg outline-none" onChange={e => setAttData({...attData, emp_id: e.target.value})} required>
                  <option value="">Select Employee...</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAttData({...attData, status: 'Present'})} className={`flex-1 py-2 rounded-lg border-2 font-bold ${attData.status === 'Present' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>Present</button>
                  <button type="button" onClick={() => setAttData({...attData, status: 'Absent'})} className={`flex-1 py-2 rounded-lg border-2 font-bold ${attData.status === 'Absent' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}>Absent</button>
                </div>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">Submit</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Search size={16}/> Logs</h3>
                <input type="date" className="border rounded p-1 text-sm" onChange={(e) => setDateFilter(e.target.value)} />
              </div>
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                  <tr><th className="px-6 py-3">Employee</th><th className="px-6 py-3">Date</th><th className="px-6 py-3 text-right">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAttendance.map((rec, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 font-medium text-sm">ID: {rec.employee_id}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{rec.date}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{rec.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-slate-400 text-xs mt-10">
        © 2026 HRMS Lite • {stats.total} Employees • {stats.presentToday} Present Today
      </footer>
    </div>
  );
}

export default App;