import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CRITERIA, GRADE_BANDING } from '../data/naacConfig';
import { Shield, CheckCircle, ArrowRight, Sparkles, BookOpen, Target, Award } from 'lucide-react';

export default function Landing() {
  const { login, loadSampleData, darkMode, isAuthenticated } = useData();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    login();
    loadSampleData();
    navigate('/dashboard');
  };

  const handleLogin = () => {
    login();
    navigate('/dashboard');
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              NAAC 7-Criteria Framework • 1000 Points Assessment
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Institutional Grade &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Score Assessment Platform
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10">
              Comprehensive NAAC accreditation readiness tool. Enter your data, get instant CGPA calculation, 
              identify gaps, and generate your Self Study Report — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDemoLogin}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Try with Sample Data
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                Start Fresh
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need for NAAC Accreditation
            </h2>
            <p className={`mt-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              From data entry to report generation, manage the entire accreditation workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Data Entry Module', desc: 'Enter data for all 7 criteria with validation, autosave, and evidence attachments' },
              { icon: Target, title: 'Live Score Calculation', desc: 'Instant CGPA and grade calculation as you enter data. No manual refresh needed.' },
              { icon: BarChart3Icon, title: 'Gap Analysis Engine', desc: 'What-if sliders to simulate improvements and see exact targets for next grade band' },
              { icon: Shield, title: 'Evidence Vault', desc: 'Upload and organize proof documents linked to each metric with expiry tracking' },
              { icon: Award, title: 'SSR Report Generator', desc: 'Generate PDF/Excel Self Study Report in NAAC format from your entered data' },
              { icon: CheckCircle, title: 'Validation & Review', desc: 'Automatic validation, missing data alerts, and comprehensive review checklist' },
            ].map((feature, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1
                ${darkMode ? 'bg-gray-700 border-gray-600 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7 Criteria Overview */}
      <div className={`py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              The 7 NAAC Criteria
            </h2>
            <p className={`mt-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              1000 total weightage points distributed across 7 criteria
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRITERIA.map(criterion => (
              <div key={criterion.id} className={`p-5 rounded-xl border transition-all hover:shadow-md
                ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{criterion.icon}</span>
                  <div>
                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{criterion.shortName}</h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{criterion.weightage} points</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {criterion.keyIndicators.slice(0, 3).map((ki, i) => (
                    <p key={i} className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>• {ki}</p>
                  ))}
                  {criterion.keyIndicators.length > 3 && (
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>+{criterion.keyIndicators.length - 3} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Banding */}
      <div className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              NAAC Grade Banding
            </h2>
            <p className={`mt-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              CGPA to Grade mapping as per NAAC guidelines
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GRADE_BANDING.map(band => (
              <div key={band.grade} className={`p-4 rounded-xl text-center border
                ${band.grade.startsWith('A') 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : band.grade.startsWith('B') 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}>
                <p className={`text-2xl font-bold ${
                  band.grade.startsWith('A') ? 'text-green-700 dark:text-green-400' :
                  band.grade.startsWith('B') ? 'text-yellow-700 dark:text-yellow-400' :
                  'text-red-700 dark:text-red-400'
                }`}>{band.grade}</p>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {band.cgpaMin.toFixed(2)} - {band.cgpaMax.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{band.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Assess Your Institution?</h2>
          <p className="text-lg text-white/80 mb-8">
            Load sample data to explore all features, or start entering your institution's data from scratch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDemoLogin}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Launch Demo with Sample Data
            </button>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              Start with Empty Data
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            NAAC Institutional Grade & Score Assessment Platform v2.0.0 • Based on NAAC 7-Criteria Framework
          </p>
        </div>
      </footer>
    </div>
  );
}

function BarChart3Icon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}
