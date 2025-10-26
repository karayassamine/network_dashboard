import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// API Base URL
const API_BASE = 'http://localhost:5000';

// Hook pour l'optimisation HD 1280×720
const useHDOptimization = () => {
  const isHDResolution = useMediaQuery('(max-width: 1280px)');
  const isLowHeight = useMediaQuery('(max-height: 720px)');
  const isSmallWindow = useMediaQuery('(max-width: 800px)');
  
  return { isHDResolution, isLowHeight, isSmallWindow };
};

const drawerWidth = 240;

// Enhanced color palette for better clarity and contrast
const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  background: '#0F172A',
  card: '#1E293B',
  sidebar: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  divider: '#475569'
};

// API Functions
const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE}/Dashboard`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Calculate stats from the data - FIXED: Handle both array and object responses
    const resultsArray = Array.isArray(data) ? data : (data.results || []);
    const totalFlows = resultsArray.length;
    const benignCount = resultsArray.filter(item => item.result === 'Benign').length;
    const attackCount = totalFlows - benignCount;
    const activeThreats = attackCount;

    return {
      totalFlows,
      benignCount,
      attackCount,
      activeThreats,
      avgResponseTime: 42,
      trafficTrend: 'up',
      rawData: resultsArray
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalFlows: 0,
      benignCount: 0,
      attackCount: 0,
      activeThreats: 0,
      avgResponseTime: 0,
      trafficTrend: 'up',
      rawData: []
    };
  }
};

const fetchResults = async () => {
  try {
    const response = await fetch(`${API_BASE}/results`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
};

const fetchArchiveData = async () => {
  try {
    const response = await fetch(`${API_BASE}/Archive`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching archive data:', error);
    return [];
  }
};

const archiveResult = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/Dashboard/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error archiving result:', error);
    return { message: 'Error archiving result' };
  }
};

const uploadAndAnalyzeFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/Scan`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return {
      classification: result.result,
      attackName: result.result !== 'Benign' ? result.result : null,
      confidence: result.prob,
      filename: result.filename,
      dataSource: result.data_source || 'direct_csv_analysis',
      hasActualLabel: result.has_actual_label || true
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { 
      classification: 'Error', 
      attackName: null, 
      confidence: 0,
      error: error.message,
      dataSource: 'error'
    };
  }
};

const fetchLatestScan = async () => {
  try {
    const response = await fetch(`${API_BASE}/scanning`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest scan:', error);
    return { error: 'No data received' };
  }
};

// Enhanced Stat Card Component with HD optimization
const StatCard = ({ title, value, subtitle, icon, color, progress }) => {
  const { isSmallWindow } = useHDOptimization();
  
  return (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${color}30`,
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        height: isSmallWindow ? 100 : 120,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${color}15`
        }
      }}
    >
      <CardContent sx={{ p: isSmallWindow ? 1.5 : 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color={color}
              fontSize={isSmallWindow ? '1.25rem' : '1.5rem'}
            >
              {value}
            </Typography>
            <Typography 
              variant="subtitle2" 
              color={COLORS.textSecondary}
              sx={{ opacity: 0.9 }}
              fontSize={isSmallWindow ? '0.7rem' : '0.75rem'}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${color}25, ${color}15)`,
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            {React.cloneElement(icon, { fontSize: isSmallWindow ? 'small' : 'medium' })}
          </Box>
        </Stack>
        <Typography 
          variant="body2" 
          color={COLORS.textMuted}
          fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}
        >
          {subtitle}
        </Typography>
        {progress && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              mt: 1.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 2
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalFlows: 0,
    benignCount: 0,
    attackCount: 0,
    activeThreats: 0,
    avgResponseTime: 0,
    trafficTrend: 'up',
    rawData: []
  });

  const [latestScan, setLatestScan] = useState(null);
  const { isHDResolution, isLowHeight, isSmallWindow } = useHDOptimization();

  useEffect(() => {
    const loadData = async () => {
      const dashboardData = await fetchDashboardData();
      setStats(dashboardData);
      
      const scanData = await fetchLatestScan();
      if (!scanData.error) {
        setLatestScan(scanData);
      }
    };

    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const benignPercent = stats.totalFlows ? (stats.benignCount / stats.totalFlows) * 100 : 0;
  const attackPercent = stats.totalFlows ? (stats.attackCount / stats.totalFlows) * 100 : 0;

  const barData = [
    { name: 'Benign', flows: stats.benignCount, color: COLORS.success },
    { name: 'Attack', flows: stats.attackCount, color: COLORS.error },
  ];

  const pieData = [
    { name: 'Benign', value: stats.benignCount },
    { name: 'Attack', value: stats.attackCount },
  ];

  // Calculate threat types from raw data
  const threatTypes = stats.rawData.reduce((acc, item) => {
    if (item.result !== 'Benign') {
      acc[item.result] = (acc[item.result] || 0) + 1;
    }
    return acc;
  }, {});

  const threatData = Object.entries(threatTypes).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: count,
    severity: count > 10 ? 'High' : count > 5 ? 'Medium' : 'Low'
  }));

  const chartHeight = isSmallWindow ? 200 : 250;
  const spacing = isSmallWindow ? 1.5 : 2;
  const headerSize = isSmallWindow ? '1.5rem' : isLowHeight ? '1.75rem' : '2rem';

  return (
    <Box sx={{ p: isSmallWindow ? 1 : 2 }}>
      {/* Header Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={3}>
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            gutterBottom 
            fontSize={headerSize}
            color={COLORS.textPrimary}
          >
            Security Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            color={COLORS.textSecondary}
            fontSize={isSmallWindow ? '0.8rem' : '0.9rem'}
          >
            Real-time Network Monitoring & Threat Detection
          </Typography>
        </Box>
        <Chip 
          icon={<TrendingUpIcon />} 
          label="Live Monitoring" 
          color="success" 
          variant="outlined"
          sx={{ 
            fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
            borderColor: COLORS.success,
            color: COLORS.success
          }}
        />
      </Stack>

      {/* Latest Scan Alert */}
      {latestScan && latestScan.result && (
        <Card sx={{ 
          mb: 3, 
          background: `linear-gradient(135deg, ${latestScan.result !== 'Benign' ? COLORS.error : COLORS.success}15, transparent)`,
          border: `1px solid ${latestScan.result !== 'Benign' ? COLORS.error : COLORS.success}30`
        }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" color={COLORS.textPrimary} fontSize={isSmallWindow ? '0.9rem' : '1rem'}>
                  Latest Scan: {latestScan.filename}
                </Typography>
                <Typography variant="body2" color={COLORS.textSecondary} fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}>
                  Result: <strong style={{ color: latestScan.result !== 'Benign' ? COLORS.error : COLORS.success }}>
                    {latestScan.result} {latestScan.result !== 'Benign' ? 'Attack' : ''}
                  </strong>
                  {latestScan.timestamp && ` • Time: ${new Date(latestScan.timestamp).toLocaleString()}`}
                </Typography>
                <Typography variant="body2" color={COLORS.textMuted} fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}>
                  Data Source: Direct CSV Analysis • Realistic Confidence Level
                </Typography>
              </Box>
              <Chip 
                label={`${latestScan.prob}% confidence`}
                size="small"
                color={latestScan.result !== 'Benign' ? 'error' : 'success'}
                sx={{ fontSize: isSmallWindow ? '0.6rem' : '0.7rem' }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <Grid container spacing={spacing} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total Flows"
            value={stats.totalFlows.toLocaleString()}
            subtitle="Analyzed network flows"
            icon={<AnalyticsIcon sx={{ color: COLORS.primary }} />}
            color={COLORS.primary}
            progress={65}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Active Threats"
            value={stats.activeThreats}
            subtitle="Detected attacks"
            icon={<WarningIcon sx={{ color: COLORS.error }} />}
            color={COLORS.error}
            progress={stats.activeThreats > 0 ? 85 : 10}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Benign Traffic"
            value={`${benignPercent.toFixed(1)}%`}
            subtitle="Safe network activity"
            icon={<SecurityIcon sx={{ color: COLORS.success }} />}
            color={COLORS.success}
            progress={benignPercent}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Detection Rate"
            value={`${stats.attackCount > 0 ? '100%' : '0%'}`}
            subtitle="Threat identification"
            icon={<TrendingUpIcon sx={{ color: COLORS.warning }} />}
            color={COLORS.warning}
            progress={stats.attackCount > 0 ? 100 : 0}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={spacing}>
        {/* Traffic Flow Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.background})`,
            border: `1px solid ${COLORS.border}`,
            height: '100%',
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ p: isSmallWindow ? 1.5 : 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight="bold" 
                fontSize={isSmallWindow ? '0.9rem' : '1rem'}
                color={COLORS.textPrimary}
                mb={1.5}
              >
                Traffic Flow Distribution
              </Typography>
              
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.success }} />
                        <Typography 
                          variant="subtitle2" 
                          fontSize={isSmallWindow ? '0.75rem' : '0.85rem'}
                          color={COLORS.textPrimary}
                          fontWeight="bold"
                        >
                          Benign Flows
                        </Typography>
                      </Stack>
                      <Typography 
                        variant="h6" 
                        color={COLORS.success}
                        fontWeight="bold"
                        fontSize={isSmallWindow ? '0.95rem' : '1.1rem'}
                      >
                        {benignPercent.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={benignPercent}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${COLORS.success}15`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: COLORS.success,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.error }} />
                        <Typography 
                          variant="subtitle2" 
                          fontSize={isSmallWindow ? '0.75rem' : '0.85rem'}
                          color={COLORS.textPrimary}
                          fontWeight="bold"
                        >
                          Attack Flows
                        </Typography>
                      </Stack>
                      <Typography 
                        variant="h6" 
                        color={COLORS.error}
                        fontWeight="bold"
                        fontSize={isSmallWindow ? '0.95rem' : '1.1rem'}
                      >
                        {attackPercent.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={attackPercent}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${COLORS.error}15`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: COLORS.error,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                </Stack>

                <Box sx={{ textAlign: 'center', mt: 2, pt: 1.5, borderTop: `1px solid ${COLORS.divider}` }}>
                  <Typography 
                    variant="body2" 
                    color={COLORS.textMuted}
                    fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}
                    mb={0.5}
                  >
                    Total Flows
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={COLORS.textPrimary}
                    fontWeight="bold"
                    fontSize={isSmallWindow ? '1.3rem' : '1.6rem'}
                  >
                    {stats.totalFlows.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Traffic Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.background})`,
            border: `1px solid ${COLORS.border}`,
            height: '100%',
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ p: isSmallWindow ? 1.5 : 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight="bold" 
                fontSize={isSmallWindow ? '0.9rem' : '1rem'}
                color={COLORS.textPrimary}
                mb={1.5}
              >
                Traffic Distribution
              </Typography>
              
              <Box sx={{ flex: 1, minHeight: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={barData} 
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.divider} />
                    <XAxis 
                      dataKey="name"
                      stroke={COLORS.textSecondary}
                      fontSize={isSmallWindow ? 9 : 11}
                    />
                    <YAxis 
                      stroke={COLORS.textSecondary}
                      fontSize={isSmallWindow ? 9 : 11}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        color: COLORS.textPrimary,
                        fontSize: isSmallWindow ? 10 : 11
                      }}
                      formatter={(value) => [`${value} flows`, 'Count']}
                    />
                    <Bar 
                      dataKey="flows" 
                      radius={[4, 4, 0, 0]}
                      barSize={35}
                      maxBarSize={35}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Stack direction="row" justifyContent="center" spacing={3} mt={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: COLORS.success }} />
                  <Typography variant="body2" color={COLORS.textSecondary} fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}>
                    Benign
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: COLORS.error }} />
                  <Typography variant="body2" color={COLORS.textSecondary} fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}>
                    Attack
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Threat Overview Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 2, 
            background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.background})`,
            border: `1px solid ${COLORS.border}`,
            height: '100%',
            minHeight: 280,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent sx={{ p: isSmallWindow ? 1.5 : 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight="bold" 
                fontSize={isSmallWindow ? '0.9rem' : '1rem'}
                color={COLORS.textPrimary}
                mb={1.5}
              >
                Threat Overview
              </Typography>
              
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  position: 'relative', 
                  height: 110,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 1.5
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isSmallWindow ? 30 : 38}
                        outerRadius={isSmallWindow ? 48 : 55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? COLORS.success : COLORS.error} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} flows`, 'Count']}
                        contentStyle={{ 
                          backgroundColor: COLORS.card,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 6,
                          color: COLORS.textPrimary,
                          fontSize: isSmallWindow ? 10 : 11
                        }}
                      />
                      <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={COLORS.textPrimary}
                        fontSize={isSmallWindow ? 11 : 12}
                        fontWeight="bold"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={COLORS.textSecondary}
                        fontSize={isSmallWindow ? 9 : 10}
                      >
                        {stats.totalFlows}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Stack direction="row" justifyContent="center" spacing={2.5} mb={2}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.success }} />
                    <Typography variant="body2" color={COLORS.textSecondary} fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}>
                      Benign
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS.error }} />
                    <Typography variant="body2" color={COLORS.textSecondary} fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}>
                      Attack
                    </Typography>
                  </Stack>
                </Stack>

                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    color={COLORS.textSecondary}
                    fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}
                    mb={1}
                    textAlign="center"
                  >
                    Threat Breakdown
                  </Typography>
                  <Grid container spacing={0.75}>
                    {threatData.slice(0, 4).map((threat, index) => (
                      <Grid item xs={6} key={index}>
                        <Card 
                          variant="outlined"
                          sx={{ 
                            border: `1px solid ${COLORS.border}`,
                            background: `linear-gradient(135deg, ${
                              threat.severity === 'High' ? `${COLORS.error}10` :
                              threat.severity === 'Medium' ? `${COLORS.warning}08` : `${COLORS.success}08`
                            }, transparent)`,
                            p: 0.75,
                            textAlign: 'center'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontSize={isSmallWindow ? '0.65rem' : '0.7rem'}
                            color={COLORS.textSecondary}
                            mb={0.25}
                          >
                            {threat.type}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontSize={isSmallWindow ? '0.9rem' : '1rem'}
                            fontWeight="bold"
                            color={
                              threat.severity === 'High' ? COLORS.error :
                              threat.severity === 'Medium' ? COLORS.warning : COLORS.success
                            }
                          >
                            {threat.count}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const FlowAnalysisPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isSmallWindow } = useHDOptimization();

  const handleFileChange = (event) => {
    setResult(null);
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first.');
      return;
    }
    setLoading(true);
    const analysis = await uploadAndAnalyzeFile(selectedFile);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      mx: 'auto', 
      mt: 2, 
      p: isSmallWindow ? 1 : 2,
      width: { xs: '100%', sm: '90%', md: 500 }
    }}>
      <Card sx={{ 
        borderRadius: 2,
        background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.background})`,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
      }}>
        <CardContent sx={{ p: isSmallWindow ? 2 : 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: `linear-gradient(135deg, ${COLORS.primary}25, ${COLORS.primary}15)`
            }}>
              <SecurityIcon sx={{ fontSize: isSmallWindow ? 30 : 36, color: COLORS.primary }} />
            </Box>
            
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                gutterBottom 
                fontSize={isSmallWindow ? '1.25rem' : '1.5rem'}
                color={COLORS.textPrimary}
              >
                Threat Analysis
              </Typography>
              <Typography 
                variant="body1" 
                color={COLORS.textSecondary}
                fontSize={isSmallWindow ? '0.8rem' : '0.9rem'}
              >
                Upload CSV network flow data for security analysis
              </Typography>
            </Box>

            <Box sx={{ width: '100%' }}>
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="upload-file-button"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-file-button" style={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    width: '100%',
                    py: 1.5,
                    border: '2px dashed',
                    borderColor: COLORS.primary,
                    color: COLORS.textPrimary,
                    fontSize: isSmallWindow ? '0.8rem' : '0.9rem',
                    '&:hover': {
                      border: '2px dashed',
                      borderColor: COLORS.primary,
                      backgroundColor: `${COLORS.primary}10`
                    }
                  }}
                >
                  Choose CSV File
                </Button>
              </label>

              {selectedFile && (
                <Typography 
                  sx={{ mt: 1.5, textAlign: 'center' }} 
                  fontSize={isSmallWindow ? '0.8rem' : '0.9rem'}
                  color={COLORS.textSecondary}
                >
                  Selected: <strong style={{ color: COLORS.textPrimary }}>{selectedFile.name}</strong>
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleAnalyzeClick}
              disabled={loading || !selectedFile}
              sx={{
                px: 3,
                py: 1,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: COLORS.textPrimary,
                fontWeight: 'bold',
                fontSize: isSmallWindow ? '0.8rem' : '0.9rem',
                '&:hover': {
                  background: `linear-gradient(135deg, ${COLORS.primary}DD, ${COLORS.secondary}DD)`
                },
                '&:disabled': {
                  background: COLORS.divider,
                  color: COLORS.textMuted
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1, color: COLORS.textPrimary }} />
                  Analyzing...
                </>
              ) : (
                'Start Analysis'
              )}
            </Button>

            {result && (
              <Card sx={{ 
                width: '100%', 
                mt: 2,
                background: result.classification !== 'Benign' && result.classification !== 'Error' ? 
                  `linear-gradient(135deg, ${COLORS.error}15, ${COLORS.error}08)` :
                  result.classification === 'Error' ?
                  `linear-gradient(135deg, ${COLORS.warning}15, ${COLORS.warning}08)` :
                  `linear-gradient(135deg, ${COLORS.success}15, ${COLORS.success}08)`,
                border: `1px solid ${
                  result.classification !== 'Benign' && result.classification !== 'Error' ? COLORS.error : 
                  result.classification === 'Error' ? COLORS.warning : COLORS.success
                }30`
              }}>
                <CardContent>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box sx={{
                      p: 0.75,
                      borderRadius: '50%',
                      background: result.classification !== 'Benign' && result.classification !== 'Error' ? COLORS.error : 
                                 result.classification === 'Error' ? COLORS.warning : COLORS.success
                    }}>
                      {result.classification !== 'Benign' && result.classification !== 'Error' ? 
                        <WarningIcon sx={{ color: COLORS.textPrimary, fontSize: isSmallWindow ? 18 : 20 }} /> : 
                        result.classification === 'Error' ?
                        <WarningIcon sx={{ color: COLORS.textPrimary, fontSize: isSmallWindow ? 18 : 20 }} /> :
                        <SecurityIcon sx={{ color: COLORS.textPrimary, fontSize: isSmallWindow ? 18 : 20 }} />
                      }
                    </Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      fontSize={isSmallWindow ? '1rem' : '1.25rem'}
                      color={result.classification !== 'Benign' && result.classification !== 'Error' ? COLORS.error : 
                             result.classification === 'Error' ? COLORS.warning : COLORS.success}
                    >
                      {result.classification === 'Error' ? 'Analysis Error' : result.classification}
                    </Typography>
                    {result.attackName && (
                      <Chip 
                        label={result.attackName} 
                        sx={{ 
                          fontSize: isSmallWindow ? '0.65rem' : '0.75rem',
                          backgroundColor: `${COLORS.error}20`,
                          color: COLORS.error,
                          border: `1px solid ${COLORS.error}30`
                        }}
                      />
                    )}
                    {result.confidence > 0 && (
                      <Typography 
                        variant="body2" 
                        color={COLORS.textSecondary}
                        fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}
                      >
                        Confidence: <strong style={{ color: COLORS.textPrimary }}>{result.confidence}%</strong>
                      </Typography>
                    )}
                    {result.filename && (
                      <Typography 
                        variant="body2" 
                        color={COLORS.textSecondary}
                        fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}
                      >
                        File: <strong style={{ color: COLORS.textPrimary }}>{result.filename}</strong>
                      </Typography>
                    )}
                    {result.dataSource && (
                      <Typography 
                        variant="body2" 
                        color={COLORS.textMuted}
                        fontSize={isSmallWindow ? '0.65rem' : '0.75rem'}
                        textAlign="center"
                      >
                        Data Source: {result.dataSource === 'direct_csv_analysis' ? 'Direct CSV Analysis' : result.dataSource}
                      </Typography>
                    )}
                    {result.error && (
                      <Typography 
                        variant="body2" 
                        color={COLORS.error}
                        fontSize={isSmallWindow ? '0.7rem' : '0.8rem'}
                        textAlign="center"
                      >
                        Error: {result.error}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const HistoryLogPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSmallWindow } = useHDOptimization();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      const data = await fetchResults();
      setResults(data);
      setLoading(false);
    };

    loadResults();
  }, []);

  const handleArchive = async (id) => {
    await archiveResult(id);
    // Refresh the results
    const data = await fetchResults();
    setResults(data);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isSmallWindow ? 1 : 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={3}>
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            gutterBottom 
            fontSize={isSmallWindow ? '1.25rem' : '1.5rem'}
            color={COLORS.textPrimary}
          >
            Security Logs
          </Typography>
          <Typography 
            variant="h6" 
            color={COLORS.textSecondary}
            fontSize={isSmallWindow ? '0.8rem' : '0.9rem'}
          >
            Historical threat detection and network activity
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<HistoryIcon />} 
          size="small"
          sx={{
            borderColor: COLORS.primary,
            color: COLORS.primary,
            fontSize: isSmallWindow ? '0.7rem' : '0.8rem',
            '&:hover': {
              borderColor: COLORS.primary,
              backgroundColor: `${COLORS.primary}10`
            }
          }}
          onClick={() => window.location.reload()}
        >
          Refresh Logs
        </Button>
      </Stack>

      <Card sx={{ 
        borderRadius: 2, 
        background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.background})`,
        border: `1px solid ${COLORS.border}`
      }}>
        <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
          <Table sx={{ minWidth: 500 }} size="small" aria-label="history log table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Date
                </TableCell>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Filename
                </TableCell>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Result
                </TableCell>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Confidence
                </TableCell>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  fontSize: isSmallWindow ? '0.65rem' : '0.75rem', 
                  fontWeight: 'bold',
                  color: COLORS.textPrimary,
                  borderColor: COLORS.divider,
                  py: 1
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((entry) => (
                <TableRow 
                  key={entry.id}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: `${COLORS.primary}08`
                    }
                  }}
                >
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    color: COLORS.textSecondary,
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    {new Date(entry.date).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    <Chip 
                      label={entry.filename} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: isSmallWindow ? '0.55rem' : '0.65rem',
                        height: 20,
                        backgroundColor: `${COLORS.info}15`,
                        color: COLORS.info,
                        borderColor: `${COLORS.info}30`
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    <Chip 
                      label={entry.result}
                      size="small"
                      sx={{ 
                        fontSize: isSmallWindow ? '0.55rem' : '0.65rem',
                        height: 20,
                        backgroundColor: 
                          entry.result === 'Benign' ? `${COLORS.success}20` :
                          `${COLORS.error}20`,
                        color: 
                          entry.result === 'Benign' ? COLORS.success : COLORS.error,
                        borderColor: 
                          entry.result === 'Benign' ? `${COLORS.success}30` :
                          `${COLORS.error}30`
                      }}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    color: COLORS.textSecondary,
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    {entry.probability ? `${entry.probability}%` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    <Chip 
                      label={entry.archive ? 'Archived' : 'Active'}
                      size="small"
                      sx={{ 
                        fontSize: isSmallWindow ? '0.55rem' : '0.65rem',
                        height: 20,
                        backgroundColor: 
                          entry.archive ? `${COLORS.warning}20` : `${COLORS.success}20`,
                        color: 
                          entry.archive ? COLORS.warning : COLORS.success,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: isSmallWindow ? '0.6rem' : '0.7rem',
                    borderColor: COLORS.divider,
                    py: 0.75
                  }}>
                    {!entry.archive && (
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: isSmallWindow ? '0.55rem' : '0.65rem',
                          height: 20,
                          borderColor: COLORS.warning,
                          color: COLORS.warning,
                          '&:hover': {
                            borderColor: COLORS.warning,
                            backgroundColor: `${COLORS.warning}10`
                          }
                        }}
                        onClick={() => handleArchive(entry.id)}
                      >
                        Archive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color={COLORS.textSecondary}>
              No results found
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default function MonitoringDashboard() {
  const [selectedPage, setSelectedPage] = useState('Dashboard');
  const { isSmallWindow } = useHDOptimization();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Flow Analysis', icon: <AnalyticsIcon /> },
    { text: 'History Log', icon: <HistoryIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.background}, ${COLORS.card})` }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1300,
          background: `rgba(30, 41, 59, 0.9)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.border}`
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <SecurityIcon sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' }, color: COLORS.primary, fontSize: isSmallWindow ? '1.25rem' : '1.5rem' }} />
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontSize: isSmallWindow ? '1rem' : '1.125rem',
              color: COLORS.textPrimary
            }}
          >
            CyberShield Analytics
          </Typography>
          <IconButton color="inherit" size="small" sx={{ color: COLORS.textSecondary, p: 0.5 }}>
            <NotificationsIcon fontSize={isSmallWindow ? 'small' : 'medium'} />
          </IconButton>
          <IconButton color="inherit" size="small" sx={{ color: COLORS.textSecondary, p: 0.5, ml: 0.5 }}>
            <AccountCircleIcon fontSize={isSmallWindow ? 'small' : 'medium'} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${COLORS.sidebar}, ${COLORS.background})`,
            borderRight: `1px solid ${COLORS.border}`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 1.5, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="h6" color={COLORS.textSecondary} sx={{ px: 1, mb: 1, fontSize: '0.9rem' }}>
            Navigation
          </Typography>
        </Box>
        <Divider sx={{ borderColor: COLORS.divider }} />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={selectedPage === item.text}
              onClick={() => setSelectedPage(item.text)}
              sx={{
                borderRadius: 1.5,
                mx: 0.5,
                mb: 0.5,
                px: 1.5,
                py: 1,
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}15)`,
                  border: `1px solid ${COLORS.primary}30`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.primary}25, ${COLORS.secondary}20)`,
                  }
                },
                '&:hover': {
                  background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}08)`,
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedPage === item.text ? COLORS.primary : COLORS.textSecondary,
                minWidth: 40
              }}>
                {React.cloneElement(item.icon, { fontSize: isSmallWindow ? 'small' : 'medium' })}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: selectedPage === item.text ? 'bold' : 'normal',
                  fontSize: isSmallWindow ? '0.8rem' : '0.875rem',
                  color: selectedPage === item.text ? COLORS.textPrimary : COLORS.textSecondary
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          background: `linear-gradient(135deg, ${COLORS.background}, ${COLORS.card})`,
          p: { xs: 1, sm: 1.5 }, 
          mt: '56px',
          color: COLORS.textPrimary,
        }}
      >
        {selectedPage === 'Dashboard' && <DashboardPage />}
        {selectedPage === 'Flow Analysis' && <FlowAnalysisPage />}
        {selectedPage === 'History Log' && <HistoryLogPage />}
      </Box>
    </Box>
  );
}