import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// FIX: Removed unused 'Users' and 'CalendarCheck' to prevent Vercel build failure
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Building } from 'lucide-react';

// FIX: Dynamic API URL for deployment
const API = process.env.REACT_APP_API_URL || "https://hrms-lite-1.vercel.app";

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
      const res = await axios.post(
  `${API}/employees`,
  payload,
  {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }
);
      alert(res.data.message || "Employee added successfully!"); 
      setFormData({ emp_id: '', name: '', email: '', dept: '' });
      fetchAllData();
    } catch (err) { 
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
    if (window.confirm("Remove this employee and all their records?")) {
      try {
        const res = await axios.delete(`${API}/employees/${id}`);
        alert(res.data.message || "Record Deleted.");
        fetchAllData();
      } catch (err) { alert("Delete failed. This employee may have attendance records attached."); }
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100">
            <Briefcase className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HRMS <span className="text-indigo-600">Lite</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setView('employees')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'employees' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Employees
          </button>
          <button onClick={() => setView('attendance')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Attendance Logs
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {view === 'employees' ? (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="text-indigo-500" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Register New Employee</h2>
              </div>
              <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input className="input-style" placeholder="ID (e.g. 101)" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} required />
                <input className="input-style" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input className="input-style" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input className="input-style" placeholder="Department" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} required />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95">Add</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Employee Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">No employees found in the directory.</td></tr>
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
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-fit sticky top-28">
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="text-indigo-500" size={24} />
                  <h2 className="text-xl font-bold">Mark Status</h2>
                </div>
                <form onSubmit={markAttendance} className="space-y-5">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Employee</label>
                  <select className="input-style w-full" onChange={e => setAttData({...attData, emp_id: e.target.value})} required>
                    <option value="">Choose Employee...</option>
                    {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAttData({...attData, status: 'Present'})} className={`py-3 rounded-xl font-bold border-2 transition-all ${attData.status === 'Present' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>Present</button>
                    <button type="button" onClick={() => setAttData({...attData, status: 'Absent'})} className={`py-3 rounded-xl font-bold border-2 transition-all ${attData.status === 'Absent' ? 'border-rose-600 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}>Absent</button>
                  </div>
                  <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black shadow-lg active:scale-95 transition-all">Submit Log</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold flex items-center gap-2"><Filter size={18} className="text-slate-400"/> Attendance History</h3>
                  <input type="date" className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setDateFilter(e.target.value)} />
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0 border-b z-10">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Employee ID</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttendance.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400">No records found for this selection.</td></tr>
                      ) : (
                        filteredAttendance.map((rec, i) => (
                          <tr key={i} className="hover:bg-slate-50/30">
                            <td className="px-6 py-4 font-semibold text-slate-700">{rec.employee_id}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{rec.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {rec.status}
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
          </div>
        )}
      </main>
      <footer className="p-10 text-center text-slate-400 text-xs border-t border-slate-100 bg-white">
        <p>© 2026 HRMS Lite Admin Portal • {stats.total} Total Employees • {stats.presentToday} Present Today</p>
      </footer>
    </div>
  );
}

export default App;
