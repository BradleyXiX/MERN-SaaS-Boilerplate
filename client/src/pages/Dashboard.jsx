import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to fetch user');
        navigate('/login');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Logout failed');
    }
  };

  if (!user) {
    return <div className="p-4"><p>Loading...</p></div>;
  }

  return (
    <div className="p-4">
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {message && <p className="text-red-600">{message}</p>}
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2">
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
