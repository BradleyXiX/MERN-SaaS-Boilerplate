import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Verify() {
  const [message, setMessage] = useState('Verifying...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        setMessage(res.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Error verifying');
      }
    };
    if (token) verify();
  }, [token]);

  return <div className="p-4"><p>{message}</p></div>;
}

export default Verify;
