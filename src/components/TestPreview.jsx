import React, { useState, useEffect } from 'react';
import { ChevronLeft, Edit, GripVertical, Trash2, Plus, ChevronDown, X, Check, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTestsStore } from '../store/useTestsStore';
import { useShuffleTests } from '../hooks/useShuffleTests';
import MCQQuestionWizard from './MCQQuestionWizard';
import ReadingQuestionWizard from './ReadingQuestionWizard';
import WritingQuestionWizard from './WritingQuestionWizard';
import FillInTheBlankQuestionWizard from './FillInTheBlankQuestionWizard';
import ExportModal from './ExportModal';

function extractTextFromHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || doc.body.innerText || '';
}

const getQuestionPreview = (question) => {
  if (question.type === 'reading' || question.type === 'fill-in-the-blank') {
    if (question.title) {
      return question.title;
    }
    if (question.passage) {
      return extractTextFromHTML(question.passage).split(' ').slice(0, 10).join(' ') + '...';
    }
  }
  if (question.text) {
    return extractTextFromHTML(question.text).split(' ').slice(0, 10).join(' ') + '...';
  }
  return 'Question';
}

export default function TestPreview() {
  const navigate = useNavigate();
  const { selectedTest, deleteQuestion, updateQuestion, updateTestName, addTest } = useTestsStore();
  const { validateShuffle, generateTests } = useShuffleTests();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  const toggleQuestion = (questionId) => {
    setCollapsedQuestions(prevState => ({
      ...prevState,
      [questionId]: !prevState[questionId]
    }));
  };

  useEffect(() => {
    if (selectedTest) {
      setNewTestName(selectedTest.name);
    }
  }, [selectedTest]);

  if (!selectedTest) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-gray-400 text-center text-lg">No test selected.</div>
    );
  }
  // Backwards-compat: if this test still has `sections` (legacy), derive questions from them.
  const flattenSectionsToQuestions = (test) => {
    if (!test) return [];
    if (Array.isArray(test.questions) && test.questions.length > 0) return test.questions;
    const secs = test.sections || [];
    const flattened = [];
    secs.forEach((s) => {
      (s.questions || []).forEach(q => flattened.push(q));
    });
    return flattened;
  };

  const questions = flattenSectionsToQuestions(selectedTest);

  const openWizard = (type, question = null) => {
    setWizard({ type, question });
    setActiveDropdown(null);
  }

  const handleNameChange = (e) => {
    setNewTestName(e.target.value);
  };

  const handleNameSave = () => {
    if (newTestName.trim() && newTestName.trim() !== selectedTest.name) {
      updateTestName(selectedTest.id, newTestName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setNewTestName(selectedTest.name);
    setIsEditingName(false);
  };

  if (wizard?.type === 'mcq') {
    return <MCQQuestionWizard onClose={() => setWizard(null)} question={wizard.question} />;
  }

  if (wizard?.type === 'reading') {
    return <ReadingQuestionWizard onClose={() => setWizard(null)} question={wizard.question} />;
  }

  if (wizard?.type === 'writing') {
    return <WritingQuestionWizard onClose={() => setWizard(null)} question={wizard.question} />;
  }

  if (wizard?.type === 'fill-in-the-blank') {
    return <FillInTheBlankQuestionWizard onClose={() => setWizard(null)} question={wizard.question} />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-t-lg shadow-sm px-6 py-4 border-b border-gray-200">
        <h1 className="text-lg font-medium text-gray-600">Test Preview</h1>
      </div>
      <div className="bg-gray-100 rounded-b-lg shadow-lg p-6">
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-sm font-medium"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTestName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave();
                          if (e.key === 'Escape') handleNameCancel();
                        }}
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={handleNameSave} className="p-1 text-green-600 hover:text-green-700"><Check size={22} /></button>
                      <button onClick={handleNameCancel} className="p-1 text-red-600 hover:text-red-700"><X size={22} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">{selectedTest?.name || 'Untitled Test'}</h1>
                      {selectedTest.name !== 'Master Test' && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Edit test name"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === 'header' ? null : 'header')}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                          >
                            Add Question
                          </button>
                          {activeDropdown === 'header' && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => { setActiveDropdown(null); openWizard('mcq'); }}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                              >
                                Multi Choice
                              </button>
                              <button
                                onClick={() => { setActiveDropdown(null); openWizard('reading'); }}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                              >
                                Reading Question
                              </button>
                              <button
                                onClick={() => { setActiveDropdown(null); openWizard('writing'); }}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                              >
                                Writing Question
                              </button>
                              <button
                                onClick={() => { setActiveDropdown(null); openWizard('fill-in-the-blank'); }}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                              >
                                Fill-in-the-blank
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const res = validateShuffle(selectedTest);
                            if (!res.valid) return alert(res.error || 'Cannot shuffle this test');
                            const newTests = generateTests(selectedTest);
                            newTests.forEach(nt => addTest(nt));
                            alert('Shuffled test generated');
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Shuffle
                        </button>
                        <button
                          onClick={() => setExportOpen(true)}
                          className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                        >
                          Export
                        </button>
                      </div>
              </div>
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Test Questions</h2>
                </div>
                <div className="space-y-8">
                  {/* Shuffle now runs inline like TestsList; no modal needed */}

                  {questions.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No questions in this test.</div>
                  ) : (
                    <>
                      {questions.map((q, index) => (
                        <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                          <button onClick={() => toggleQuestion(q.id)} className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 mb-4">
                            <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}: {collapsedQuestions[q.id] && <span>{getQuestionPreview(q)}</span>}</p>
                          </button>
                          {!collapsedQuestions[q.id] && (
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-move">
                                <GripVertical size={20} />
                              </div>
                              <div className="flex-1">
                                {/* render body depending on type */}
                                {q.title && <p className="font-semibold text-gray-900 mb-3 text-base">{q.title}</p>}
                                {q.type === 'reading' && q.passage && <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.passage }} />}
                                {q.type === 'fill-in-the-blank' && q.passage && (
                                  <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                                    {q.passage.split('{blank}').map((part, pIdx, arr) => (
                                      <React.Fragment key={pIdx}>
                                        <span dangerouslySetInnerHTML={{ __html: part }} />
                                        {pIdx < arr.length - 1 && (
                                          <span className="inline-block w-20 border-b border-gray-400 mx-2">({pIdx + 1})</span>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}

                                {q.type === 'writing' && (
                                  <div>
                                    <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.text }} />
                                    <div className="space-y-2 ml-2"><p className="text-green-700">{q.answer}</p></div>
                                  </div>
                                )}

                                {q.type === 'mcq' && (
                                  <div>
                                    <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.text }} />
                                    <div className="space-y-2 ml-2">
                                      {q.options && q.options.map((opt, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 text-gray-700 py-1 ${idx === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                          <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                                          <span>{opt}</span>
                                          {idx === q.correctAnswer && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {(q.type === 'reading' || q.type === 'fill-in-the-blank') && q.questions && q.questions.map((subQ, subQIndex) => (
                                  <div key={subQ.id} className="mb-4 relative group">
                                    <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}.{subQIndex + 1}: <span dangerouslySetInnerHTML={{ __html: subQ.text }} /></p>
                                    <div className="space-y-2 ml-2">
                                      {subQ.options && subQ.options.map((opt, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 text-gray-700 py-1 ${idx === subQ.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                          <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                                          <span>{opt}</span>
                                          {idx === subQ.correctAnswer && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}


                                

                              </div>
                              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openWizard(q.type === 'mcq' ? 'mcq' : q.type === 'fill-in-the-blank' ? 'fill-in-the-blank' : q.type === 'reading' ? 'reading' : 'writing', q)}
                                  className="p-1 text-gray-500 hover:text-blue-600"
                                  title="Edit question"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this question?')) {
                                      deleteQuestion(q.id);
                                    }
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-600"
                                  title="Delete question"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Question moved to header for visibility when there are no questions */}
                    </>
                  )}
                </div>
              </div>
              {exportOpen && (
                <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} test={selectedTest} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
