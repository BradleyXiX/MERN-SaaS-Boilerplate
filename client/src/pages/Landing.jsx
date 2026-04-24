import { Box, Button, Container, Typography, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, ChevronRight } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <Paper 
    className={`glass-panel animate-slide-up delay-${delay}`}
    sx={{ 
      p: 4, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.4)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)'
      }
    }}
  >
    <Box sx={{ color: 'primary.main', mb: 2 }}>
      {icon}
    </Box>
    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

function Landing() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Box component="nav" sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Zap size={24} /> SaaS Pro
        </Typography>
        <Box sx={{ gap: 2, display: 'flex' }}>
          <Button component={Link} to="/login" color="inherit">Login</Button>
          <Button component={Link} to="/signup" variant="contained" color="primary">Get Started</Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 8, pb: 12 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6} className="animate-fade-in">
            <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '3rem', md: '4.5rem' }, mb: 2, background: 'linear-gradient(to right, #818CF8, #4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Build Faster. Scale Better.
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
              The premium MERN stack boilerplate with authentication, security, and a stunning UI out of the box.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                component={Link} 
                to="/signup" 
                variant="contained" 
                size="large"
                endIcon={<ChevronRight />}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                Start for free
              </Button>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined" 
                size="large"
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Sign In
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} className="animate-slide-up delay-200">
            <Box 
              className="glass-panel"
              sx={{ 
                height: '400px', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(20px)' }} />
              <Box sx={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(30px)' }} />
              
              <Typography variant="h4" sx={{ zIndex: 1, color: 'text.secondary', fontWeight: 300, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield size={40} color="#4F46E5" /> Secure Dashboard
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ mt: 16 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
            Everything you need
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                delay="100"
                icon={<Lock size={48} />}
                title="Secure Authentication"
                description="JWT-based authentication with email verification and password reset flows built-in."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                delay="200"
                icon={<Zap size={48} />}
                title="Lightning Fast"
                description="Built on Vite and React for incredibly fast hot module replacement and optimized builds."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                delay="300"
                icon={<Shield size={48} />}
                title="Production Ready"
                description="Configured with Helmet, Morgan, and Winston for secure and observable deployments."
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;
