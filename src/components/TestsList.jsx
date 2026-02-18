import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, Trash2, Download, Shuffle } from 'lucide-react';
import { useTestsStore } from '../store/useTestsStore';
import ExportModal from './ExportModal';
import { useShuffleTests } from '../hooks/useShuffleTests';

export default function TestsList() {
  const { tests, selectTest, deleteTest, addTest } = useTestsStore();
  const navigate = useNavigate();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState(null);
  const { validateShuffle, generateTests } = useShuffleTests();

  const handleNewTest = () => navigate('/new-test');
  const handleTestClick = (test) => {
    selectTest(test);
    navigate(`/test/${test.id}`);
  };

  const handleDelete = (e, testId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this test?')) {
      deleteTest(testId);
    }
  };

  if (!tests || !Array.isArray(tests)) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
        <div className="sm:flex-1 min-w-0">
          <h1 className="pt-2 text-4xl font-bold text-gray-900 mb-2">My Tests</h1>
          <p className="text-gray-600">Manage your tests and assessments</p>
        </div>
        <button 
          onClick={handleNewTest}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md shrink-0"
        >
          <Plus size={20} />
          <span className="font-medium">New Test</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 py-12">No tests found.</div>
        ) : (
          tests.map((test, index) => (
            <div 
              key={test.id}
              onClick={() => handleTestClick(test)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-700 font-bold rounded-full w-10 h-10 flex items-center justify-center">{index + 1}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{test.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExportTarget(test); setExportOpen(true); }}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      title="Export test"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const res = validateShuffle(test);
                        if (!res.valid) {
                          return alert(res.error || 'Cannot shuffle this test');
                        }
                        const newTests = generateTests(test);
                        newTests.forEach(nt => addTest(nt));
                        alert('Shuffled test generated');
                      }}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                      title="Generate shuffled test"
                    >
                      <Shuffle size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, test.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete test"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">{test.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    <span>Created: {new Date(test.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FileText size={16} className="mr-2" />
                    <span>{test.questions ? test.questions.length : (test.sections ? test.sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0) : test.questionCount || 0)} Questions</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 group-hover:text-green-600 transition-colors font-medium">Click to open →</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {exportOpen && (
        <ExportModal open={exportOpen} onClose={() => { setExportOpen(false); setExportTarget(null); }} test={exportTarget} />
      )}
    </div>
  );
}
