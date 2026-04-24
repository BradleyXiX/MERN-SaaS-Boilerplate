import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Container,
  Typography,
  Box,
  Paper,
  InputAdornment
} from '@mui/material';
import { Mail, KeyRound } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container component="main" maxWidth="sm">
        <Paper 
          className="glass-panel animate-fade-in" 
          elevation={0} 
          sx={{ padding: { xs: 4, md: 6 }, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}
        >
          {/* Decorative background blur */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(245, 158, 11, 0.3)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', mb: 2 }}>
                <KeyRound size={32} color="#F59E0B" />
              </Box>
              <Typography component="h1" variant="h4" fontWeight="700" gutterBottom>
                Forgot Password
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color={errors.email ? '#ef4444' : '#94A3B8'} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1.1rem', backgroundColor: '#F59E0B', '&:hover': { backgroundColor: '#D97706' } }}
                onClick={handleSubmit}
                disabled={Object.keys(errors).length > 0 || isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              {message && (
                <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mt: 2, borderRadius: '8px' }}>
                  {message}
                </Alert>
              )}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 500 }}>
                  Back to login
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;
