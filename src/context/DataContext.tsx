import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AllData, generateSampleData, getEmptyData } from '../data/sampleData';
import { AssessmentResult, calculateScores } from '../utils/calculations';

interface DataContextType {
  data: AllData;
  scores: AssessmentResult;
  setData: (newData: AllData) => void;
  updateMetric: (criterionId: string, metricId: string, value: number | string | boolean, status?: string) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AllData>(() => {
    const saved = localStorage.getItem('naac_data');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return getEmptyData();
  });

  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('naac_dark') === 'true';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('naac_auth') === 'true';
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const scores = calculateScores(data);

  const setData = useCallback((newData: AllData) => {
    setDataState(newData);
    localStorage.setItem('naac_data', JSON.stringify(newData));
  }, []);

  const updateMetric = useCallback((criterionId: string, metricId: string, value: number | string | boolean, status?: string) => {
    setDataState(prev => {
      const newData: AllData = JSON.parse(JSON.stringify(prev));
      if (!newData[criterionId]) newData[criterionId] = {};
      newData[criterionId][metricId] = {
        value,
        status: (status as any) || (value !== '' && value !== null ? 'completed' : 'not_started'),
      };
      localStorage.setItem('naac_data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const loadSampleData = useCallback(() => {
    const sample = generateSampleData();
    setData(sample);
    showToast('Sample data loaded successfully!', 'success');
  }, []);

  const clearAllData = useCallback(() => {
    const empty = getEmptyData();
    setData(empty);
    showToast('All data cleared.', 'info');
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setData(imported);
      showToast('Data imported successfully!', 'success');
      return true;
    } catch {
      showToast('Invalid JSON file.', 'error');
      return false;
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('naac_dark', String(next));
      return next;
    });
  }, []);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('naac_auth', 'true');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('naac_auth');
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DataContext.Provider value={{
      data, scores, setData, updateMetric, loadSampleData, clearAllData,
      exportData, importData, selectedYear, setSelectedYear,
      darkMode, toggleDarkMode, isAuthenticated, login, logout, toast, showToast,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
