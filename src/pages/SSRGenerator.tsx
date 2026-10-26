import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { FileText, Download, Printer, CheckCircle, Loader2 } from 'lucide-react';

export default function SSRGenerator() {
  const { data, scores, darkMode, showToast } = useData();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      showToast('SSR Report generated successfully!', 'success');
    }, 2000);
  };

  const handleExportText = () => {
    let report = `NAAC SELF STUDY REPORT\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `Institutional CGPA: ${scores.cgpa.toFixed(2)} / 4.00\n`;
    report += `Predicted Grade: ${scores.grade} (${scores.status})\n`;
    report += `Total Score: ${Math.round(scores.totalScore)} / 1000\n\n`;
    
    CRITERIA.forEach((criterion, i) => {
      const cs = scores.criteria[i];
      report += `\n${'─'.repeat(40)}\n`;
      report += `${criterion.id}: ${criterion.name}\n`;
      report += `Weightage: ${criterion.weightage} | Score: ${Math.round(cs?.totalEarned || 0)} | GPA: ${(cs?.gpa || 0).toFixed(2)}\n`;
      report += `${'─'.repeat(40)}\n\n`;
      
      criterion.metrics.forEach(metric => {
        const metricData = data[criterion.id]?.[metric.id];
        const ms = cs?.metrics.find(m => m.metricId === metric.id);
        const value = metricData?.value;
        
        report += `  ${metric.id}. ${metric.label}\n`;
        if (metric.type === 'calculated') {
          report += `     [Auto-calculated]\n`;
        } else if (metric.type === 'boolean') {
          report += `     Value: ${value ? 'Yes' : 'No'}\n`;
        } else if (metric.type === 'text') {
          report += `     Value: ${String(value || 'Not provided').substring(0, 100)}...\n`;
        } else {
          report += `     Value: ${value ?? '—'} ${metric.unit || ''} (Benchmark: ${metric.benchmark ?? '—'})\n`;
        }
        if (ms && ms.maxScore > 0) {
          report += `     Score: ${ms.earned.toFixed(1)}/${ms.maxScore} (${ms.percentage.toFixed(0)}%)\n`;
        }
        report += `\n`;
      });
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NAAC_SSR_Report.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported as text file!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          SSR Document Exporter
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Generate your Self Study Report in NAAC format
        </p>
      </div>

      {/* Summary Card */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Self Study Report</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Based on entered data across all 7 criteria</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(scores.totalScore)}/1000</p>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CGPA</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scores.cgpa.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Grade</p>
            <p className={`text-2xl font-bold ${
              scores.grade.startsWith('A') ? 'text-green-600 dark:text-green-400' :
              scores.grade.startsWith('B') ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>{scores.grade}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
          {generated && (
            <>
              <button
                onClick={handleExportText}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all
                  ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <Download className="w-4 h-4" />
                Export as Text
              </button>
              <button
                onClick={() => window.print()}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all
                  ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generated Report Preview */}
      {generated && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Report Preview</h3>
          </div>

          <div className={`p-6 rounded-xl border font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto
            ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
            <pre className="whitespace-pre-wrap">
{`NAAC SELF STUDY REPORT
${'═'.repeat(50)}

Institutional Performance Summary
─────────────────────────────────
Total Score: ${Math.round(scores.totalScore)} / 1000
CGPA: ${scores.cgpa.toFixed(2)} / 4.00
Predicted Grade: ${scores.grade} (${scores.status})

${CRITERIA.map((c, i) => {
  const cs = scores.criteria[i];
  return `${c.icon} ${c.id}: ${c.name}
   Score: ${Math.round(cs?.totalEarned || 0)}/${c.weightage} | GPA: ${(cs?.gpa || 0).toFixed(2)}/4.00
   ${'─'.repeat(35)}
${c.metrics.map(m => {
  const md = data[c.id]?.[m.id];
  const ms = cs?.metrics.find(s => s.metricId === m.id);
  const val = md?.value;
  let valStr = '';
  if (m.type === 'calculated') valStr = '[Auto-calculated]';
  else if (m.type === 'boolean') valStr = val ? 'Yes ✓' : 'No ✗';
  else if (m.type === 'text') valStr = String(val || 'Not provided').substring(0, 60);
  else valStr = `${val ?? '—'} ${m.unit || ''}`;
  return `   ${m.id}. ${m.label}
      Value: ${valStr}
      ${ms && ms.maxScore > 0 ? `Score: ${ms.earned.toFixed(1)}/${ms.maxScore} (${ms.percentage.toFixed(0)}%)` : ''}`;
}).join('\n\n')}
`;
}).join('\n')}
${'═'.repeat(50)}
Report generated on: ${new Date().toLocaleDateString()}
Generated by: NAAC Institutional Grade & Score Assessment Platform v2.0.0`}
            </pre>
          </div>
        </div>
      )}

      {/* Criteria Summary Table */}
      {generated && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Criteria-wise Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Criterion</th>
                  <th className={`text-right py-3 px-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weightage</th>
                  <th className={`text-right py-3 px-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</th>
                  <th className={`text-right py-3 px-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>%</th>
                  <th className={`text-right py-3 px-3 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>GPA</th>
                </tr>
              </thead>
              <tbody>
                {CRITERIA.map((c, i) => {
                  const cs = scores.criteria[i];
                  return (
                    <tr key={c.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {c.icon} {c.id}: {c.name}
                      </td>
                      <td className={`py-3 px-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{c.weightage}</td>
                      <td className={`py-3 px-3 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(cs?.totalEarned || 0)}</td>
                      <td className={`py-3 px-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(cs?.percentage || 0).toFixed(1)}%</td>
                      <td className={`py-3 px-3 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{(cs?.gpa || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <td className="py-3 px-3">TOTAL</td>
                  <td className="py-3 px-3 text-right">1000</td>
                  <td className="py-3 px-3 text-right">{Math.round(scores.totalScore)}</td>
                  <td className="py-3 px-3 text-right">{(scores.totalScore / 10).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right">{scores.cgpa.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
