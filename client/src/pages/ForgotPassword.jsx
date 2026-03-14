import { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="p-4">
      <h2>Forgot Password</h2>
      <div>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <button onClick={handleSubmit} disabled={Object.keys(errors).length > 0}>Send Reset Link</button>
      {message && <p>{message}</p>}
      <div className="mt-2">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}

export default ForgotPassword;
