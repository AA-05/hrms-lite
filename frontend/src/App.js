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
    } catch (err) { 
        console.error("Fetch failed", err); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      // FIX: Matches the Pydantic schema in your models.py
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
      alert(typeof detail === 'string' ? detail : "Error: ID exists or Email is invalid.");
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!attData.emp_id) return alert("Select an employee.");
    try {
      // FIX: Payload key changed from emp_id to employee_id to match backend
      const payload = {
        employee_id: attData.emp_id,
        status: attData.status
      };
      await axios.post(`${API}/attendance`, payload);
      alert("Attendance recorded!");
      setAttData({ emp_id: '', status: 'Present' });
      fetchAllData();
    } catch (err) { 
        console.error(err);
        alert("Failed to mark attendance. Ensure the employee exists."); 
    }
  };

  const deleteEmp = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await axios.delete(`${API}/employees/${id}`);
        fetchAllData();
      } catch (err) { 
          alert("Delete failed. Check attendance records."); 
      }
    }
  };

  const filteredAttendance = useMemo(() => {
    return dateFilter ? attendance.filter(r => r.date === dateFilter) : attendance;
  }, [attendance, dateFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b p-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Briefcase className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">HRMS <span className="text-indigo-600">Lite</span></span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('employees')} 
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Employees
          </button>
          <button 
            onClick={() => setView('attendance')} 
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Attendance Logs
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'employees' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-500" /> Register New Employee
              </h2>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input placeholder="ID (e.g. 101)" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
                <input placeholder="Full Name" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Email Address" type="email" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input placeholder="Department" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95">Add</button>
              </form>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">No employees found.</td></tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp.employee_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{emp.employee_id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{emp.full_name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12}/>{emp.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                            <Building size={12}/> {emp.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteEmp(emp.employee_id)} className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm h-fit">
              <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ClipboardList className="text-indigo-500" size={20} /> Mark Status
              </h2>
              <form onSubmit={markAttendance} className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase">Select Employee</label>
                <select className="border border-slate-200 w-full p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={attData.emp_id} onChange={e => setAttData({...attData, emp_id: e.target.value})} required>
                  <option value="">Choose Employee...</option>
                  {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAttData({...attData, status: 'Present'})} className={`py-2.5 rounded-xl font-bold border-2 transition-all ${attData.status === 'Present' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>Present</button>
                  <button type="button" onClick={() => setAttData({...attData, status: 'Absent'})} className={`py-2.5 rounded-xl font-bold border-2 transition-all ${attData.status === 'Absent' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}>Absent</button>
                </div>
                <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">Submit Log</button>
              </form>
            </div>
            
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><Filter size={18} className="text-slate-400"/> Attendance History</h3>
                 <input type="date" className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setDateFilter(e.target.value)} />
               </div>
               <div className="max-h-[500px] overflow-y-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Employee ID</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredAttendance.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400">No records found.</td></tr>
                      ) : (
                        filteredAttendance.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-700">{r.employee_id}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{r.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>
      <footer className="p-8 text-center text-slate-400 text-xs border-t border-slate-100 bg-white">
        <p>© 2026 HRMS Lite Admin Portal • {employees.length} Total Employees Registered</p>
      </footer>
    </div>
  );
}

export default App;