import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error resetting password');
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
          <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, background: 'rgba(79, 70, 229, 0.3)', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '16px', background: 'rgba(79, 70, 229, 0.1)', mb: 2 }}>
                <KeyRound size={32} color="#4F46E5" />
              </Box>
              <Typography component="h1" variant="h4" fontWeight="700" gutterBottom>
                Reset Password
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your new password below.
              </Typography>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                autoFocus
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
                sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1.1rem' }}
                onClick={handleReset}
                disabled={Object.keys(errors).length > 0 || isLoading}
              >
                {isLoading ? 'Updating...' : 'Change Password'}
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

export default ResetPassword;
