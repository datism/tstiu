import React, { useEffect, useRef } from 'react';
import { ListChecks, Edit3, BookOpen, FileText, X } from 'lucide-react';

export default function HelpModal({ show, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (show) {
      window.addEventListener('keydown', onKey);
      // focus the close button for keyboard users
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-auto ring-1 ring-gray-100 text-left">
        <header className="flex items-start justify-between mb-4">
          <div>
            <h3 id="help-title" className="text-2xl font-semibold text-gray-900">Quick Help & Tips</h3>
            <p className="text-sm text-gray-600 mt-1">Manage Tests: create tests, add questions, shuffle, preview and export.</p>
          </div>
          <div className="ml-4">
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close help"
              className="p-2 text-gray-600 hover:text-gray-900 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            ><X /></button>
          </div>
        </header>

        <div className="text-sm text-gray-700 space-y-6">
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Glossary</div>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Test</div>
                  <div className="text-sm text-gray-600 mt-1">Primary unit in this app: a standalone assessment you can edit, preview, shuffle and export.</div>
                </div>
                <div className="sm:col-span-2 bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Question</div>
                  <div className="text-sm text-gray-600 mt-1">Single item in a test: MCQ, Fill‑in‑the‑Blank, Reading, or Writing (open response).</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Create a Test</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>From <strong>My Tests</strong> click <em>New Test</em> to create an empty test (or import a JSON export).</li>
                  <li>Open the test and use <em>Add Question</em> to populate it.</li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Add / Edit Questions</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <h5 className="text-sm font-medium text-gray-800">Quick steps</h5>
                    <ol className="list-decimal list-inside mt-2 text-sm text-gray-700 space-y-1">
                      <li>Open the test you want to edit.</li>
                      <li>Click <em>Add Question</em> or the edit icon next to a question to open the appropriate wizard.</li>
                      <li>Fill fields and click <em>Save</em>.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600"><ListChecks size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">MCQ (Multiple Choice)</div>
                          <div className="text-sm text-gray-600 mt-1">Enter question text, add options, mark correct option.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600"><Edit3 size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Fill‑in‑the‑Blank</div>
                          <div className="text-sm text-gray-600 mt-1">Write a passage and use <code>{'{blank}'}</code> for blanks. Each blank becomes a sub-question.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-indigo-600"><BookOpen size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Reading</div>
                          <div className="text-sm text-gray-600 mt-1">Add a passage, then create MCQ-style sub-questions tied to the passage.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-yellow-600"><FileText size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Writing</div>
                          <div className="text-sm text-gray-600 mt-1">Open-response prompts. Expected answers are stored for export but are not auto-graded.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Export</div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2 text-sm text-gray-700">
                <div>Use the <em>download</em> icon on a test card or the <em>Export</em> button inside a Test Preview.</div>
                <div><strong>DOCX:</strong> Print-ready test document. You can add per-test instructions in the export modal.</div>
                <div><strong>Excel (XLSX):</strong> When exporting multiple tests, enable <em>Export answers to Excel</em> to include an answers workbook. Each column = test; each row = answer index.</div>
                <div><strong>JSON:</strong> Use the JSON option to export/import test data for backups or migrating between instances.</div>
              </div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Shuffle</div>
                </div>
              </div>
              <div className="md:col-span-2 text-sm text-gray-700">
                Click <em>Shuffle</em> inside a Test Preview or use the shuffle icon on a test card to generate a new shuffled test. Current behaviour: top-level question order is shuffled and MCQ options are shuffled; nested sub-questions are preserved.
              </div>
            </div>
          </section>

          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Tips</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  <li>Populate a test with varied top-level questions to improve shuffle results.</li>
                  <li>Use <em>Preview</em> to verify formatting before exporting.</li>
                  <li>If export fails, ensure the test contains questions (the exporter skips empty tests).</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
