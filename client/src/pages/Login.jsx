import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      setMessage(errMsg);
      console.error(errMsg);
    }
  };

  return (
    <div className="p-4">
      <h2>Login</h2>
      <div>
        <input 
          type="email" 
          placeholder="Email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div>
        <input 
          type="password" 
          placeholder="Password"
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>
      <button onClick={handleLogin} disabled={Object.keys(errors).length > 0}>Login</button>
      {message && <p className="text-red-600">{message}</p>}
      <div className="mt-2">
        <Link to="/signup">Sign up</Link> | <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
}

export default Login;