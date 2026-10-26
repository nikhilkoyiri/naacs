import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getDataCompletion } from '../utils/calculations';
import { 
  LayoutDashboard, Database, BarChart3, FileText, Shield, 
  Menu, X, Sun, Moon, LogOut, ChevronRight, Upload, FolderOpen,
  CheckCircle, AlertTriangle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { darkMode, toggleDarkMode, logout, isAuthenticated, scores, data } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const completion = getDataCompletion(data);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/data-entry', label: 'Data Entry', icon: Database },
    { path: '/data-entry/bulk-upload', label: 'Bulk Upload', icon: Upload },
    { path: '/data-entry/evidence-vault', label: 'Evidence Vault', icon: FolderOpen },
    { path: '/data-entry/review', label: 'Review & Submit', icon: CheckCircle },
    { path: '/analytics/gap-analysis', label: 'Gap Analysis', icon: BarChart3 },
    { path: '/reports/ssr-generator', label: 'SSR Report', icon: FileText },
  ];

  const criteriaNav = [
    { path: '/criteria/1', label: 'C1: Curricular', color: 'bg-indigo-500' },
    { path: '/criteria/2', label: 'C2: Teaching', color: 'bg-purple-500' },
    { path: '/criteria/3', label: 'C3: Research', color: 'bg-pink-500' },
    { path: '/criteria/4', label: 'C4: Infrastructure', color: 'bg-amber-500' },
    { path: '/criteria/5', label: 'C5: Student Support', color: 'bg-emerald-500' },
    { path: '/criteria/6', label: 'C6: Governance', color: 'bg-cyan-500' },
    { path: '/criteria/7', label: 'C7: Values', color: 'bg-orange-500' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>NAAC Assessment</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Grade & Score Platform</p>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Score</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scores.totalScore}<span className="text-sm font-normal">/1000</span></p>
                </div>
                <div className={`text-center px-3 py-2 rounded-lg ${
                  scores.grade.startsWith('A') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  scores.grade.startsWith('B') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <p className="text-xl font-bold">{scores.grade}</p>
                  <p className="text-xs">{scores.cgpa.toFixed(2)} CGPA</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Data Completion</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{completion.overall}%</span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${completion.overall}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className={`pt-3 mt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Criteria Analysis
              </p>
              {criteriaNav.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${location.pathname === item.path 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-lg
          ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                {completion.overall < 50 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-xs font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Complete data entry for accurate scores
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                <ChevronRight className="w-3 h-3" />
                IQAC Coordinator
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
