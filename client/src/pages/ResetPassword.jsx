import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleReset = async () => {
    try {
      const res = await axios.post('/api/auth/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error resetting password');
    }
  };

  return (
    <div className="p-4">
      <h2>Reset Password</h2>
      <input
        placeholder="New password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleReset}>Change Password</button>
      {message && <p>{message}</p>}
      <div className="mt-2">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}

export default ResetPassword;
