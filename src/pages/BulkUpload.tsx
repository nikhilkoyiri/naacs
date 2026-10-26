import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function BulkUpload() {
  const { data, setData, darkMode, showToast } = useData();
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // Generate CSV template
    const headers = ['Criterion', 'Metric_ID', 'Metric_Label', 'Type', 'Value', 'Benchmark'];
    const rows: string[] = [headers.join(',')];
    
    CRITERIA.forEach(criterion => {
      criterion.metrics.forEach(metric => {
        if (metric.type === 'calculated') return;
        const currentValue = data[criterion.id]?.[metric.id]?.value ?? '';
        rows.push([
          criterion.id,
          metric.id,
          `"${metric.label}"`,
          metric.type,
          String(currentValue),
          metric.benchmark ?? '',
        ].join(','));
      });
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'naac_data_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      setErrors(['File appears to be empty or has no data rows.']);
      return;
    }

    const newErrors: string[] = [];
    const parsed: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 5) {
        newErrors.push(`Row ${i + 1}: Not enough columns`);
        continue;
      }

      const [criterion, metricId, label, type, value] = cols;
      
      // Validate
      const criterionObj = CRITERIA.find(c => c.id === criterion);
      if (!criterionObj) {
        newErrors.push(`Row ${i + 1}: Invalid criterion "${criterion}"`);
        continue;
      }

      const metric = criterionObj.metrics.find(m => m.id === metricId);
      if (!metric) {
        newErrors.push(`Row ${i + 1}: Invalid metric ID "${metricId}"`);
        continue;
      }

      if (type === 'number' || type === 'percent') {
        const num = Number(value);
        if (value && isNaN(num)) {
          newErrors.push(`Row ${i + 1}: "${value}" is not a valid number for ${metricId}`);
          continue;
        }
        if (num < 0) {
          newErrors.push(`Row ${i + 1}: Negative value not allowed for ${metricId}`);
          continue;
        }
        if (type === 'percent' && num > 100) {
          newErrors.push(`Row ${i + 1}: Percentage cannot exceed 100 for ${metricId}`);
          continue;
        }
      }

      parsed.push({ criterion, metricId, label, type, value, benchmark: metric.benchmark });
    }

    setPreviewData(parsed);
    setErrors(newErrors);
    setImported(false);
  };

  const handleImport = () => {
    if (!previewData) return;
    
    const newData = JSON.parse(JSON.stringify(data));
    previewData.forEach(row => {
      if (!newData[row.criterion]) newData[row.criterion] = {};
      let processedValue: any = row.value;
      if (row.type === 'number' || row.type === 'percent') {
        processedValue = Number(row.value);
      } else if (row.type === 'boolean') {
        processedValue = row.value === 'true' || row.value === '1' || row.value === 'yes';
      }
      newData[row.criterion][row.metricId] = {
        value: processedValue,
        status: row.value ? 'completed' : 'not_started',
      };
    });
    
    setData(newData);
    setImported(true);
    showToast(`Successfully imported ${previewData.length} metrics!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Bulk Upload (CSV/Excel)
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Download template, fill in your data, and upload to import all metrics at once
        </p>
      </div>

      {/* Steps */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">1</div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Download Template</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get a CSV file with all metrics pre-filled</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">2</div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Fill In Data</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter values in the Value column</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">3</div>
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload & Import</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload the file and confirm import</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadTemplate}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all hover:shadow-md
            ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload CSV File
        </button>
        <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className={`font-semibold text-red-700 dark:text-red-400`}>Validation Errors ({errors.length})</h4>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-600 dark:text-red-400">• {err}</p>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {previewData && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Preview ({previewData.length} rows)
            </h3>
            {!imported && (
              <button
                onClick={handleImport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Import
              </button>
            )}
            {imported && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Imported Successfully
              </span>
            )}
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <th className={`text-left py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Criterion</th>
                  <th className={`text-left py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Metric</th>
                  <th className={`text-left py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Value</th>
                  <th className={`text-right py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Benchmark</th>
                  <th className={`text-right py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 50).map((row, i) => {
                  const numVal = Number(row.value);
                  const benchmark = row.benchmark;
                  const isGood = benchmark && (numVal >= benchmark || (benchmark && numVal > 0));
                  return (
                    <tr key={i} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-2 px-3 font-mono text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{row.criterion}</td>
                      <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-mono text-xs">{row.metricId}</span>
                        <span className="ml-2 text-xs opacity-70">{row.label?.substring(0, 30)}</span>
                      </td>
                      <td className={`py-2 px-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{row.value || '—'}</td>
                      <td className={`py-2 px-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{benchmark ?? '—'}</td>
                      <td className="py-2 px-3 text-right">
                        {row.value ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Valid
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            Empty
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {previewData.length > 50 && (
            <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Showing first 50 of {previewData.length} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
}
