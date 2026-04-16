import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, UserPlus, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('auth/register/', formData);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try a different username or email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <BookOpen size={48} className="text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="johndoe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address (Optional)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition transform hover:-translate-y-0.5">
                <UserPlus className="mr-2" size={18} /> Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
