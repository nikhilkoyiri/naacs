import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { FolderOpen, Upload, FileText, AlertTriangle, CheckCircle, Clock, Image, Trash2 } from 'lucide-react';

interface EvidenceItem {
  id: string;
  name: string;
  criterionId: string;
  metricId: string;
  type: string;
  size: string;
  uploadDate: string;
  expiryDate?: string;
}

export default function EvidenceVault() {
  const { data, darkMode, showToast } = useData();
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [selectedCriterion, setSelectedCriterion] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ criterionId: 'C1', metricId: '', name: '', expiryDate: '' });

  const handleUpload = () => {
    if (!uploadForm.name || !uploadForm.metricId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    const newItem: EvidenceItem = {
      id: Date.now().toString(),
      name: uploadForm.name,
      criterionId: uploadForm.criterionId,
      metricId: uploadForm.metricId,
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: new Date().toLocaleDateString(),
      expiryDate: uploadForm.expiryDate || undefined,
    };
    setEvidence(prev => [...prev, newItem]);
    setUploadForm({ criterionId: 'C1', metricId: '', name: '', expiryDate: '' });
    setShowUploadModal(false);
    showToast('Evidence uploaded successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
    showToast('Evidence removed.', 'info');
  };

  const filteredEvidence = selectedCriterion === 'all' 
    ? evidence 
    : evidence.filter(e => e.criterionId === selectedCriterion);

  // Check which metrics have data but no evidence
  const metricsWithoutEvidence: { criterionId: string; metricId: string; label: string }[] = [];
  CRITERIA.forEach(criterion => {
    criterion.metrics.forEach(metric => {
      if (metric.type === 'calculated' || metric.type === 'text') return;
      const metricData = data[criterion.id]?.[metric.id];
      if (metricData && metricData.status === 'completed' && metricData.value !== '' && metricData.value !== null) {
        const hasEvidence = evidence.some(e => e.criterionId === criterion.id && e.metricId === metric.id);
        if (!hasEvidence) {
          metricsWithoutEvidence.push({ criterionId: criterion.id, metricId: metric.id, label: metric.label });
        }
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Evidence Vault
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Upload and organize proof documents for each metric
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Evidence
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{evidence.length}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Documents Uploaded</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{metricsWithoutEvidence.length}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Missing Evidence</p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {CRITERIA.reduce((sum, c) => sum + c.metrics.filter(m => m.type !== 'calculated' && m.type !== 'text').length, 0) - metricsWithoutEvidence.length}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>With Evidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className={`flex flex-wrap gap-2 p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={() => setSelectedCriterion('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${selectedCriterion === 'all' ? 'bg-indigo-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
        >
          All Criteria
        </button>
        {CRITERIA.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCriterion(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${selectedCriterion === c.id ? 'bg-indigo-500 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
          >
            {c.icon} {c.id}
          </button>
        ))}
      </div>

      {/* Evidence List */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Uploaded Documents
        </h3>
        {filteredEvidence.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No evidence documents uploaded yet. Click "Upload Evidence" to add documents.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvidence.map(item => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border
                ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${item.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    {item.type === 'pdf' ? <FileText className="w-5 h-5 text-red-600 dark:text-red-400" /> : <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.criterionId} / {item.metricId} • {item.size} • {item.uploadDate}
                      {item.expiryDate && ` • Expires: ${item.expiryDate}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing Evidence Alert */}
      {metricsWithoutEvidence.length > 0 && (
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              Metrics with Data but Missing Evidence ({metricsWithoutEvidence.length})
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {metricsWithoutEvidence.slice(0, 10).map(item => (
              <div key={`${item.criterionId}-${item.metricId}`} className={`p-2 rounded-lg text-xs ${darkMode ? 'bg-amber-900/30' : 'bg-white'}`}>
                <span className="font-medium">{item.criterionId}/{item.metricId}</span>: {item.label.substring(0, 50)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload Evidence</h3>
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Document Name *</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={e => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Research Paper - Scopus Indexed"
                  className={`w-full mt-1 p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Criterion *</label>
                <select
                  value={uploadForm.criterionId}
                  onChange={e => setUploadForm(prev => ({ ...prev, criterionId: e.target.value, metricId: '' }))}
                  className={`w-full mt-1 p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {CRITERIA.map(c => (
                    <option key={c.id} value={c.id}>{c.id}: {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Metric ID *</label>
                <select
                  value={uploadForm.metricId}
                  onChange={e => setUploadForm(prev => ({ ...prev, metricId: e.target.value }))}
                  className={`w-full mt-1 p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select metric...</option>
                  {CRITERIA.find(c => c.id === uploadForm.criterionId)?.metrics
                    .filter(m => m.type !== 'calculated' && m.type !== 'text')
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.id}: {m.label.substring(0, 50)}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={e => setUploadForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className={`w-full mt-1 p-2.5 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className={`p-4 rounded-lg border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className="text-center">
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Drag & drop or click to upload (PDF, JPG, PNG)
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Demo mode: File will be simulated
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
