import React, { useState, useEffect } from 'react';
import { 
  Users, Plane, MapPin, Activity, IndianRupee, TrendingUp, 
  ShieldCheck, ShieldAlert, UserCheck, UserX, Trash2, Search, 
  Sparkles, RefreshCw, BarChart3, PieChart as PieIcon, Layers, 
  Calendar, CheckCircle2, AlertTriangle, ArrowUpRight, Compass,
  Globe, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  getAdminOverview, getAdminStats, getAdminTrends, 
  getAdminCategories, getAdminUsers, getAdminTrips, 
  updateUserRole, updateUserStatus, deleteUserAdmin 
} from '../api/admin';
import AppLayout from '../components/AppLayout';

const CATEGORY_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#f97316'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'trends' | 'destinations' | 'trips' | 'users'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics Data
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('14d');
  const [categories, setCategories] = useState([]);

  // Management Tables Data
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');

  // Action notification
  const [notification, setNotification] = useState(null);

  const loadAllData = async () => {
    try {
      const [ovData, stData, trData, catData, uData, tData] = await Promise.all([
        getAdminOverview(),
        getAdminStats(),
        getAdminTrends(trendPeriod),
        getAdminCategories(),
        getAdminUsers(userSearch),
        getAdminTrips(tripSearch)
      ]);

      setOverview(ovData);
      setStats(stData);
      setTrends(trData);
      setCategories(catData);
      setUsers(uData);
      setTrips(tData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    getAdminTrends(trendPeriod).then(setTrends).catch(console.error);
  }, [trendPeriod]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getAdminUsers(userSearch).then(setUsers).catch(console.error);
    }, 250);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getAdminTrips(tripSearch).then(setTrips).catch(console.error);
    }, 250);
    return () => clearTimeout(timer);
  }, [tripSearch]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      await updateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      showNotification(`Updated ${user.name}'s role to ${newRole === 'ROLE_ADMIN' ? 'Administrator' : 'Standard User'}`);
    } catch (err) {
      showNotification(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleStatusToggle = async (user) => {
    const newBannedState = !user.isBanned;
    try {
      await updateUserStatus(user.id, newBannedState);
      setUsers(users.map(u => u.id === user.id ? { ...u, isBanned: newBannedState } : u));
      showNotification(`${user.name} has been ${newBannedState ? 'Suspended / Banned' : 'Reactivated'}`);
    } catch (err) {
      showNotification(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${userName}"? This will remove all their trips.`)) {
      return;
    }
    try {
      await deleteUserAdmin(userId);
      setUsers(users.filter(u => u.id !== userId));
      showNotification(`User "${userName}" deleted successfully`);
    } catch (err) {
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <AppLayout title="Admin Control Center">
        <div className="flex flex-col items-center justify-center py-28 text-slate-400">
          <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-4" />
          <p className="font-bold text-lg text-white">Aggregating platform analytics...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching adoption rates, user behavior & trip statistics</p>
        </div>
      </AppLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'trends', label: 'Adoption & Growth', icon: TrendingUp },
    { id: 'destinations', label: 'Cities & Activities', icon: Compass },
    { id: 'trips', label: 'Trip Registry', icon: Plane, count: trips.length },
    { id: 'users', label: 'User Moderation', icon: Users, count: users.length },
  ];

  return (
    <AppLayout title="Admin Portal">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Executive Panel
            </span>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            GlobeTrotter Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitor platform metrics, user engagement, top destinations, and manage community accounts.
          </p>
        </div>

        <button
          onClick={() => { setRefreshing(true); loadAllData(); }}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-2xl text-sm font-semibold border flex items-center gap-2.5 shadow-lg ${
              notification.type === 'error' 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-4 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold ${isActive ? 'bg-slate-900/30 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Total Users */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">Total Registered Users</span>
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl"><Users className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">{overview?.totalUsers || 0}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Platform Adoption Active
              </p>
            </div>

            {/* Total Trips */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Total Trips Created</span>
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl"><Plane className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">{overview?.totalTrips || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Avg. <span className="text-emerald-400 font-bold">{overview?.engagement?.avgTripsPerUser || 0}</span> trips per traveler
              </p>
            </div>

            {/* Total Spend */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Total Spend Tracked</span>
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl"><IndianRupee className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">₹{(overview?.totalBudgetSpent || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Out of ₹{(overview?.totalBudgetPlanned || 0).toLocaleString('en-IN')} planned
              </p>
            </div>

            {/* Daily & Weekly Active */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Active Engagement</span>
                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl"><Activity className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">{overview?.engagement?.dailyActive || 0} <span className="text-sm font-semibold text-purple-300">DAU</span></p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {overview?.engagement?.weeklyActive || 0} Weekly Active Users (WAU)
              </p>
            </div>

            {/* Cities Catalog */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">Destinations In Catalog</span>
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl"><MapPin className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">{overview?.totalCities || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Avg. <span className="text-rose-400 font-bold">{overview?.engagement?.avgStopsPerTrip || 0}</span> stops per itinerary
              </p>
            </div>

            {/* Activities Planned */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/10 via-fuchsia-500/5 to-transparent border border-fuchsia-500/20 backdrop-blur-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-fuchsia-400 uppercase tracking-wider">Activities Scheduled</span>
                <div className="p-2.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl"><Sparkles className="w-5 h-5" /></div>
              </div>
              <p className="text-3xl font-black text-white">{overview?.engagement?.totalTripActivities || 0}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Avg. <span className="text-fuchsia-400 font-bold">{overview?.engagement?.avgActivitiesPerTrip || 0}</span> activities per trip
              </p>
            </div>
          </div>

          {/* Area Growth Chart */}
          <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> Platform Growth & Trip Creation Velocity
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time daily new user signups and itinerary creations</p>
              </div>
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                {['7d', '14d', '30d'].map(p => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendPeriod === p ? 'bg-amber-400 text-slate-900 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrad)" />
                  <Area type="monotone" dataKey="newTrips" name="Trips Created" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#tripGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Country Spread & Quick Top Destinations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Country Distribution */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" /> User Demographic Distribution
              </h3>
              <p className="text-xs text-slate-400 mb-5">Primary locations registered by verified travelers</p>
              
              <div className="space-y-3">
                {overview?.userCountries?.map((uc, i) => (
                  <div key={uc.country} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="w-5 text-xs text-slate-500 font-bold">#{i + 1}</span> {uc.country}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {uc.userCount} user{uc.userCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
                {(!overview?.userCountries || overview?.userCountries.length === 0) && (
                  <p className="text-xs text-slate-500 py-4 text-center">No location records yet.</p>
                )}
              </div>
            </div>

            {/* Top Destinations Preview */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" /> Most Added Cities
              </h3>
              <p className="text-xs text-slate-400 mb-5">Ranked by total itinerary stop additions</p>

              <div className="space-y-3">
                {stats?.topCities?.slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                      <div>
                        <p className="text-sm font-bold text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                        ★ {c.popularityScore}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">{c.stopCount} stops</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: ADOPTION & TRENDS */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Spending & Adoption Bar Chart */}
          <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" /> Daily Itinerary Spending Trajectory
            </h3>
            <p className="text-xs text-slate-400 mb-6">Aggregated planned activity and transit expenses over time</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Daily Budget']}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="budgetSpent" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Engagement Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Trip Creation Frequency</h4>
              <p className="text-2xl font-black text-white">{overview?.engagement?.avgTripsPerUser} trips / user</p>
              <p className="text-xs text-slate-400 mt-2">Consistent repeat vacation planner usage across registered travelers.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Multi-City Depth</h4>
              <p className="text-2xl font-black text-cyan-400">{overview?.engagement?.avgStopsPerTrip} cities / trip</p>
              <p className="text-xs text-slate-400 mt-2">Average destinations linked together in unified multi-stop itineraries.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Activity Richness</h4>
              <p className="text-2xl font-black text-amber-400">{overview?.engagement?.avgActivitiesPerTrip} items / trip</p>
              <p className="text-xs text-slate-400 mt-2">Sightseeing, dining, and adventure items per vacation schedule.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: POPULAR CITIES & ACTIVITIES */}
      {activeTab === 'destinations' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Category Distribution Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] lg:col-span-1">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-fuchsia-400" /> Activity Category Split
              </h3>
              <p className="text-xs text-slate-400 mb-4">Distribution across experience types</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${val}%`, 'Share']}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-2">
                {categories.map((cat, i) => (
                  <div key={cat.category} className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {cat.category}
                    </span>
                    <span className="text-white font-bold">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 6 Popular Cities Leaderboard */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" /> Top Ranked Destinations
              </h3>
              <p className="text-xs text-slate-400 mb-6">World-class cities with highest traveler engagement</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats?.topCities?.map((city) => (
                  <div key={city.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-4 hover:border-amber-400/40 transition-all">
                    <img src={city.imageUrl} alt={city.name} className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white truncate text-base">{city.name}</h4>
                        <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          ★ {city.popularityScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{city.country}</p>
                      <p className="text-xs font-semibold text-cyan-400 mt-2">
                        {city.stopCount} Planned Stops
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Activities Catalog */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Top Scheduled Activities
            </h3>
            <p className="text-xs text-slate-400 mb-6">Most frequently booked activities in traveler itineraries</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.topActivities?.map((act) => (
                <div key={act.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3.5">
                  <img src={act.imageUrl} alt={act.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-white text-sm truncate">{act.name}</h5>
                    <span className="inline-block text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded mt-1">
                      {act.category}
                    </span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-emerald-400">₹{act.cost}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{act.usageCount} times</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: TRIP REGISTRY TABLE */}
      {activeTab === 'trips' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip name or creator..."
                value={tripSearch}
                onChange={e => setTripSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Showing {trips.length} registered trips
            </span>
          </div>

          <div className="rounded-3xl border border-white/[0.08] overflow-hidden bg-white/[0.02] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/[0.05] text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="p-4">Trip Name</th>
                    <th className="p-4">Traveler / Creator</th>
                    <th className="p-4">Travel Dates</th>
                    <th className="p-4">Budget & Spend</th>
                    <th className="p-4">Stops / Items</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {trips.map(t => {
                    const pct = t.budgetLimit > 0 ? Math.min(Math.round((t.totalSpent / t.budgetLimit) * 100), 100) : 0;
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white">
                          {t.name}
                          <span className="block text-[11px] font-mono text-slate-500 mt-0.5">ID: #{t.id}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-white">{t.userName}</p>
                          <p className="text-xs text-slate-400">{t.userEmail}</p>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-300">
                          {t.startDate} → {t.endDate}
                        </td>
                        <td className="p-4">
                          <div className="w-36">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-amber-400">₹{t.totalSpent.toLocaleString('en-IN')}</span>
                              <span className="text-slate-500">₹{t.budgetLimit.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs">
                          <span className="inline-block bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold mr-1.5">
                            {t.stopsCount} stops
                          </span>
                          <span className="inline-block bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">
                            {t.activitiesCount} items
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`/trips/${t.id}/build`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all"
                          >
                            Inspect <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {trips.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No trip records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: USER MODERATION SUITE */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name, username, email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Managing {users.length} registered accounts
            </span>
          </div>

          <div className="rounded-3xl border border-white/[0.08] overflow-hidden bg-white/[0.02] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/[0.05] text-xs uppercase font-extrabold text-slate-400 tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Verified Location</th>
                    <th className="p-4">Trips</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white text-base shrink-0">
                            {u.profilePhotoUrl ? (
                              <img src={u.profilePhotoUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              {u.name}
                              {u.role === 'ROLE_ADMIN' && (
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 inline" />
                              )}
                            </p>
                            <p className="text-xs text-slate-400">@{u.username} • {u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        {u.city || u.state || u.country ? (
                          <span className="text-slate-300">
                            📍 {[u.city, u.state, u.country].filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-500">Not specified</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white">
                          {u.tripsCount} trips
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          u.role === 'ROLE_ADMIN' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 w-fit ${
                          u.isBanned 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {u.isBanned ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleToggle(u)}
                            title={u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 cursor-pointer ${
                              u.role === 'ROLE_ADMIN'
                                ? 'bg-slate-500/10 text-slate-300 border-slate-500/20 hover:bg-slate-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleStatusToggle(u)}
                            title={u.isBanned ? 'Reactivate Account' : 'Suspend / Ban Account'}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 cursor-pointer ${
                              u.isBanned
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            }`}
                          >
                            {u.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Delete User"
                            className="p-2 rounded-xl text-xs font-bold bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-all hover:scale-105 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </AppLayout>
  );
}
