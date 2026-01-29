import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, ClipboardList, Briefcase, Filter, Loader2, Mail, Building } from 'lucide-react';

// FIX: Priority: 1. Environment Variable, 2. Hardcoded Fallback
const BASE_URL = process.env.REACT_APP_API_URL || "https://hrms-lite-backend.onrender.com";
const API = BASE_URL.replace(/\/$/, ""); // Removes trailing slash if present

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

  // ... (Include your existing markAttendance, deleteEmp, and JSX here)
  return (
    // Paste the rest of your JSX from your previous working App.js
    <div>...</div> 
  );
}

export default App;