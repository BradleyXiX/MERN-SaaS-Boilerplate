import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  AppBar,
  Toolbar,
  Avatar,
  IconButton
} from '@mui/material';
import { LogOut, User, Activity, Users, DollarSign, Zap } from 'lucide-react';

const StatCard = ({ title, value, icon, color, delay }) => (
  <Card className={`glass-panel animate-slide-up delay-${delay}`} sx={{ height: '100%', background: 'rgba(15, 23, 42, 0.4)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
      <Box>
        <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 600, letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ p: 1.5, borderRadius: '12px', background: `rgba(${color}, 0.1)` }}>
        {icon}
      </Box>
    </CardContent>
  </Card>
);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to fetch user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Logout failed');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0B0F19' }}>
        <CircularProgress sx={{ color: '#4F46E5' }} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#0B0F19', pb: 8 }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Zap size={24} /> SaaS Pro
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.email}
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton color="error" onClick={handleLogout} size="small" sx={{ ml: 1, background: 'rgba(239, 68, 68, 0.1)' }}>
                <LogOut size={18} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ mb: 6 }} className="animate-fade-in">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back, {user.name.split(' ')[0]}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your account today.
          </Typography>
        </Box>

        {message && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              delay="100" title="Total Revenue" value="$12,450" 
              icon={<DollarSign color="#10B981" />} color="16, 185, 129" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              delay="200" title="Active Users" value="1,240" 
              icon={<Users color="#4F46E5" />} color="79, 70, 229" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              delay="300" title="Activity" value="+24%" 
              icon={<Activity color="#F59E0B" />} color="245, 158, 11" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              delay="400" title="Account Status" value={user.verified ? "Verified" : "Pending"} 
              icon={<User color={user.verified ? "#10B981" : "#F59E0B"} />} 
              color={user.verified ? "16, 185, 129" : "245, 158, 11"} 
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card className="glass-panel animate-slide-up delay-200" sx={{ height: '400px', background: 'rgba(15, 23, 42, 0.4)' }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Performance Overview</Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', mt: 2 }}>
                  <Typography color="text.secondary">Chart Visualization Area</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="glass-panel animate-slide-up delay-300" sx={{ height: '400px', background: 'rgba(15, 23, 42, 0.4)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Profile Details</Typography>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>{user.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>{user.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Role</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5, textTransform: 'capitalize' }}>{user.role}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}

export default Dashboard;
