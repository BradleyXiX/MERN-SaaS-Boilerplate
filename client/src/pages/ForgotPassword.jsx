import { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
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
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>Send Reset Link</button>
      {message && <p>{message}</p>}
      <div className="mt-2">
        <a href="/login">Back to login</a>
      </div>
    </div>
  );
}

export default ForgotPassword;
