import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setMessage(res.data.message);
      // optionally redirect to login after registration
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Signup failed');
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
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(16, 185, 129, 0.3)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', mb: 2 }}>
                <UserPlus size={32} color="#10B981" />
              </Box>
              <Typography component="h1" variant="h4" fontWeight="700" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join us today and get started.
              </Typography>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color={errors.name ? '#ef4444' : '#94A3B8'} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
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

              <Button
                type="button"
                fullWidth
                variant="contained"
                size="large"
                color="secondary"
                sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1.1rem', color: 'white' }}
                onClick={handleSignup}
                disabled={Object.keys(errors).length > 0 || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              {message && (
                <Alert severity={message.includes('failed') ? 'error' : 'success'} sx={{ mt: 2, borderRadius: '8px' }}>
                  {message}
                </Alert>
              )}

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>
                    Log In
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

export default Signup;
