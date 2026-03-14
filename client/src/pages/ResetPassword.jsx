import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validateForm()) return;
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
      <div>
        <input
          placeholder="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>
      <button onClick={handleReset} disabled={Object.keys(errors).length > 0}>Change Password</button>
      {message && <p>{message}</p>}
      <div className="mt-2">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}

export default ResetPassword;
