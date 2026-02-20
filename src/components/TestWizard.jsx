import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestsStore } from '../store/useTestsStore';

// Helper to flatten legacy `sections` shape into questions array
function flattenSectionsToQuestions(test) {
  if (!test) return [];
  if (Array.isArray(test.questions) && test.questions.length > 0) return test.questions;
  const secs = test.sections || [];
  const flattened = [];
  secs.forEach((s) => {
    (s.questions || []).forEach(q => flattened.push(q));
  });
  return flattened;
}

export default function TestWizard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const { addTest } = useTestsStore();
  const navigate = useNavigate();
  const [importError, setImportError] = useState('');
  const [importName, setImportName] = useState('');
  const fileInputRef = useRef(null);
  const [importedTest, setImportedTest] = useState(null);

  function handleCreate() {
    const newTest = importedTest ? {
      id: Date.now(),
      name,
      description,
      createdDate: new Date().toISOString(),
      questions: importedTest.questions || [],
      questionCount: importedTest.questionCount || 0
    } : {
      id: Date.now(),
      name,
      description,
      createdDate: new Date().toISOString(),
      questions: [],
      questionCount: 0
    };

    addTest(newTest);
    // clear import preview after creating
    setImportedTest(null);
    setImportName('');
    navigate('/');
  }

  async function handleImportFile(e) {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setImportName(file.name);
      const parsed = JSON.parse(text);
      const tests = Array.isArray(parsed) ? parsed : [parsed];

      // For now import the first test found and allow user to confirm
      const t = tests[0];
      const questions = flattenSectionsToQuestions(t) || [];

      if (!Array.isArray(questions) || questions.length === 0) {
        setImportedTest(null);
        setImportError('No questions found in the imported test.');
        setImportName(file.name);
        return;
      }

      const preview = {
        // keep original id but we'll replace on final import
        originalId: t.id || null,
        tempId: `import-${Date.now()}`,
        name: t.name || 'Imported Test',
        description: t.description || '',
        createdDate: t.createdDate || new Date().toISOString(),
        questions,
        questionCount: questions.length,
      };

      // populate main name/description inputs and keep questions in preview
      setImportedTest({ questions: preview.questions, questionCount: preview.questionCount, originalId: preview.originalId });
      setName(preview.name);
      setDescription(preview.description);
      setImportError('');
    } catch (err) {
      console.error('Failed to import JSON test:', err);
      setImportError('Invalid JSON file or unexpected structure.');
    }
  }

  function handleCancelImport() {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setImportName('');
    setImportError('');
    setImportedTest(null);
    setName('');
    setDescription('');
  }
 

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Test</h2>
      <div className="mb-4">
        <label className="block mb-1">Test Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Import JSON
          </button>
          <div className="text-sm text-gray-600">{importName || 'No file chosen'}</div>
          {importName && (
            <button
              type="button"
              onClick={handleCancelImport}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="sr-only"
        />
        {importError && <div className="text-sm text-red-600 mt-2">{importError}</div>}
        {importedTest && (
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-100">
            <div className="text-sm text-gray-700">Imported test contains <strong>{importedTest.questionCount}</strong> questions.</div>
          </div>
        )}
      </div>
      {/* Questions are top-level now; create an empty test (add questions later in Test Preview) */}
      <button
        onClick={handleCreate}
        disabled={!name}
        className="px-8 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Create Test
      </button>
    </div>
  );
}
