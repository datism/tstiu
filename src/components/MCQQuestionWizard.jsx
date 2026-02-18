import React, { useState } from 'react';
import { useTestsStore } from '../store/useTestsStore';
import QuillEditor from './QuillEditor';
import { validateMCQQuestion } from '../utils/validation';

export default function MCQQuestionWizard({ onClose, question }) {
  const [newQuestion, setNewQuestion] = useState(
    question || {
      id: Date.now() + Math.floor(Math.random() * 10000),
      type: 'mcq',
      text: '',
      options: ['', ''],
      correctAnswer: 0
    }
  );
  const [errors, setErrors] = useState({});
  const { addQuestion, updateQuestion } = useTestsStore();
  const isEditing = !!question;

  const handleSave = () => {
    const validationErrors = validateMCQQuestion(newQuestion);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing) {
      updateQuestion(newQuestion);
    } else {
      addQuestion(newQuestion);
    }
    onClose();
  };

  const handleQuestionFieldChange = (field, value) => {
    setErrors({});
    setNewQuestion(prevQuestion => ({ ...prevQuestion, [field]: value }));
  };

  const handleOptionChange = (optIdx, value) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
        const options = prevQuestion.options.map((o, oi) => oi === optIdx ? value : o);
        return { ...prevQuestion, options };
    });
  };

  const handleAddOption = () => {
    setErrors({});
    setNewQuestion(prevQuestion => ({
        ...prevQuestion,
        options: [...prevQuestion.options, '']
    }));
  };

  const handleRemoveOption = (optIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
        const options = prevQuestion.options.filter((_, oi) => oi !== optIdx);
        let correctAnswer = prevQuestion.correctAnswer;
        if (options.length === 0) {
            options.push('');
            correctAnswer = -1;
        } else if (correctAnswer >= options.length) {
            correctAnswer = options.length - 1;
        }
        return { ...prevQuestion, options, correctAnswer };
    });
  };

  const handleSetCorrect = (optIdx) => {
    setNewQuestion(prevQuestion => ({ ...prevQuestion, correctAnswer: optIdx }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full flex justify-center items-start pt-12">
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditing ? 'Edit MCQ Question' : 'Add MCQ Question'}</h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Question</label>
                <QuillEditor
                    value={newQuestion.text}
                    onChange={value => handleQuestionFieldChange('text', value)}
                    placeholder="Enter question"
                    minHeight={50}
                />
                {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
            </div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-2 text-left">Options</label>
                <div className="space-y-2">
                {newQuestion.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleSetCorrect(oi)}
                        className={`w-8 h-8 rounded-full border ${newQuestion.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-white text-gray-700'} flex items-center justify-center`}
                        title="Mark as correct"
                    >
                        {String.fromCharCode(65 + oi)}
                    </button>
                    <input
                        type="text"
                        value={opt}
                        onChange={e => handleOptionChange(oi, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveOption(oi)}
                        className="px-2 py-1 text-red-500 hover:text-red-700"
                        title="Remove option"
                    >
                        &times;
                    </button>
                    </div>
                ))}
                {errors.options && <p className="text-red-500 text-xs mt-1">{errors.options}</p>}
                {errors.correctAnswer && <p className="text-red-500 text-xs mt-1">{errors.correctAnswer}</p>}
                <div>
                    <button
                    type="button"
                    onClick={() => handleAddOption()}
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                    + Add Option
                    </button>
                </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Correct: {newQuestion.correctAnswer >= 0 ? String.fromCharCode(65 + newQuestion.correctAnswer) : 'None'}</div>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
