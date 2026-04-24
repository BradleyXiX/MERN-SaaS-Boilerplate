import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Container,
  Typography,
  Box,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed';
      setMessage(errMsg);
      console.error(errMsg);
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
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(79, 70, 229, 0.4)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '16px', background: 'rgba(79, 70, 229, 0.1)', mb: 2 }}>
                <LogIn size={32} color="#4F46E5" />
              </Box>
              <Typography component="h1" variant="h4" fontWeight="700" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to continue to your dashboard.
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color={errors.password ? '#ef4444' : '#94A3B8'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link to="/forgot-password" style={{ color: '#818CF8', textDecoration: 'none', fontSize: '0.875rem' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="button"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1.1rem' }}
                onClick={handleLogin}
                disabled={Object.keys(errors).length > 0 || isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              {message && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                  {message}
                </Alert>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link to="/signup" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;