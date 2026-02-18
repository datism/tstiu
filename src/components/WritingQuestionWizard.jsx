import React, { useState } from 'react';
import { useTestsStore } from '../store/useTestsStore';
import QuillEditor from './QuillEditor';
import { validateWritingQuestion } from '../utils/validation';

export default function WritingQuestionWizard({ onClose, question }) {
  const [newQuestion, setNewQuestion] = useState(
    question || {
      id: Date.now() + Math.floor(Math.random() * 10000),
      type: 'writing',
      text: '',
      answer: ''
    }
  );
  const [errors, setErrors] = useState({});
  const { addQuestion, updateQuestion } = useTestsStore();
  const isEditing = !!question;

  const handleSave = () => {
    const validationErrors = validateWritingQuestion(newQuestion);
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full flex justify-center items-start pt-12">
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditing ? 'Edit Writing Question' : 'Add Writing Question'}</h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Question</label>
                <QuillEditor
                    value={newQuestion.text}
                    onChange={value => handleQuestionFieldChange('text', value)}
                    placeholder="Enter question"
                    minHeight={100}
                />
                {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
            </div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Answer</label>
                <textarea
                    value={newQuestion.answer}
                    onChange={e => handleQuestionFieldChange('answer', e.target.value)}
                    placeholder="Enter the correct answer"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows="4"
                />
                {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer}</p>}
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
