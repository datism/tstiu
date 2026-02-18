import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestsStore } from '../store/useTestsStore';
import { isNonEmpty } from '../utils/validation';

export default function TestWizard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const { addTest } = useTestsStore();
  const navigate = useNavigate();

  function handleCreate() {
    const newTest = {
      id: Date.now(),
      name,
      description,
      createdDate: new Date().toISOString(),
      questions: [],
      questionCount: 0
    };
    addTest(newTest);
    navigate('/');
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
