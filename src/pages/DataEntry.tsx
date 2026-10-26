import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { getDataCompletion } from '../utils/calculations';
import { Link } from 'react-router-dom';
import { Database, Upload, Download, Trash2, Sparkles, ChevronRight, FileSpreadsheet, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DataEntry() {
  const { data, scores, setData, loadSampleData, clearAllData, exportData, importData, darkMode, showToast } = useData();
  const completion = getDataCompletion(data);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'naac_data_export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const success = importData(result);
      if (success) showToast('Data imported successfully!', 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const getStatusIcon = (comp: number) => {
    if (comp === 100) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (comp > 0) return <Clock className="w-4 h-4 text-amber-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusLabel = (comp: number) => {
    if (comp === 100) return 'Completed';
    if (comp > 0) return 'In Progress';
    return 'Not Started';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Data Entry Hub
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Enter and manage data for all 7 NAAC criteria
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={loadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Load Sample Data
        </button>
        <button
          onClick={handleExport}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all
            ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all
            ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Upload className="w-4 h-4" />
          Import JSON
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        
        {showClearConfirm ? (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure?</span>
            <button onClick={handleClear} className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">
              Yes, Clear
            </button>
            <button onClick={() => setShowClearConfirm(false)} className={`px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Overall Progress */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Overall Data Completion</span>
          </div>
          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{completion.overall}%</span>
        </div>
        <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${completion.overall}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Current Score: {Math.round(scores.totalScore)}/1000
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            CGPA: {scores.cgpa.toFixed(2)} | Grade: {scores.grade}
          </span>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {CRITERIA.map((criterion, i) => {
          const comp = completion[criterion.id] || 0;
          const cs = scores.criteria[i];
          return (
            <Link
              key={criterion.id}
              to={`/data-entry/criterion/${i + 1}`}
              className={`group p-5 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5
                ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${criterion.color}15` }}>
                    {criterion.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {criterion.id}: {criterion.name}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {criterion.weightage} weightage points • {criterion.metrics.length} metrics
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(comp)}
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getStatusLabel(comp)}</span>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comp}%</span>
                </div>
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${comp}%`, backgroundColor: criterion.color }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                    Score: {Math.round(cs?.totalEarned || 0)}/{criterion.weightage}
                  </span>
                  <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                    GPA: {(cs?.gpa || 0).toFixed(2)}/4.0
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link to="/data-entry/bulk-upload" className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm
            ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <FileSpreadsheet className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bulk Upload (CSV)</span>
          </Link>
          <Link to="/data-entry/evidence-vault" className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm
            ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <Upload className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Evidence Vault</span>
          </Link>
          <Link to="/data-entry/review" className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm
            ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Review & Submit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
