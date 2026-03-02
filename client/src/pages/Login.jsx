import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
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
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {message && <p className="text-red-600">{message}</p>}
      <div className="mt-2">
        <Link to="/signup">Sign up</Link> | <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
}

export default Login;