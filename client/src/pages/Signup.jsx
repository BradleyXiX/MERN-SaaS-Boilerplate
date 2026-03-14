import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Real-time validation
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Valid email is required';
    }

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

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setMessage(res.data.message);
      // optionally redirect to login after registration
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Sign Up</h2>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
      <div>
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>
      <div>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div>
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>
      <button onClick={handleSignup} disabled={Object.keys(errors).length > 0}>
        Sign Up
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}

export default Signup;
