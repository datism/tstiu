
import React, { useState } from 'react';
import { useTestsStore } from '../store/useTestsStore';
import QuillEditor from './QuillEditor';
import { validateReadingQuestion } from '../utils/validation';

export default function ReadingQuestionWizard({ onClose, question }) {
  const [newQuestion, setNewQuestion] = useState(
    question || {
      id: Date.now(),
      title: '',
      passage: '',
      questions: [
        {
          id: Date.now(),
          text: '',
          options: ['', ''],
          correctAnswer: 0
        }
      ],
      type: 'reading'
    }
  );
  const [errors, setErrors] = useState({});
  const { addQuestion, updateQuestion } = useTestsStore();
  const isEditing = !!question && !question.isNew;

  const handleSave = () => {
    const validationErrors = validateReadingQuestion(newQuestion);
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

  const handleQuestionFieldChange = (field, value, subQIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
      if (subQIdx !== undefined) {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) =>
          j === subQIdx ? { ...subQ, [field]: value } : subQ
        );
        return { ...prevQuestion, questions: updatedSubQuestions };
      }
      return { ...prevQuestion, [field]: value };
    });
  };

  const handleOptionChange = (subQIdx, optIdx, value) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
      const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
        if (j !== subQIdx) return subQ;
        const options = subQ.options.map((o, oi) => oi === optIdx ? value : o);
        return { ...subQ, options };
      });
      return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleAddOption = (subQIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            return { ...subQ, options: [...subQ.options, ''] };
        });
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleRemoveOption = (subQIdx, optIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            const options = subQ.options.filter((_, oi) => oi !== optIdx);
            let correctAnswer = subQ.correctAnswer;
            if (options.length === 0) {
                options.push('');
                correctAnswer = 0;
            } else if (correctAnswer >= options.length) {
                correctAnswer = options.length - 1;
            }
            return { ...subQ, options, correctAnswer };
        });
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleSetCorrect = (subQIdx, optIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) =>
            j === subQIdx ? { ...subQ, correctAnswer: optIdx } : subQ
        );
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleAddSubQuestion = () => {
    setErrors({});
    setNewQuestion(prevQuestion => ({
        ...prevQuestion,
        questions: [
            ...prevQuestion.questions,
            {
                id: Date.now() + Math.floor(Math.random() * 10000) + 1,
                text: '',
                options: ['', ''],
                correctAnswer: 0
            }
        ]
    }));
  };

  const handleRemoveSubQuestion = (subQIdx) => {
    setErrors({});
    setNewQuestion(prevQuestion => ({
        ...prevQuestion,
        questions: prevQuestion.questions.filter((_, j) => j !== subQIdx)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full flex justify-center items-start pt-12">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditing ? 'Edit Reading Question' : 'Add Reading Question'}</h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Title (Optional)</label>
                <input
                    type="text"
                    value={newQuestion.title}
                    onChange={e => handleQuestionFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    placeholder="Enter reading passage title"
                />
            </div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Passage</label>
                <QuillEditor
                    value={newQuestion.passage || ''}
                    onChange={value => handleQuestionFieldChange('passage', value)}
                    placeholder="Paste the reading passage here"
                    minHeight={150}
                />
                {errors.passage && <p className="text-red-500 text-xs italic">{errors.passage}</p>}
            </div>

            {errors.questions && <p className="text-red-500 text-xs italic">{errors.questions}</p>}
            {newQuestion.questions.map((subQ, subQIdx) => (
              <div key={subQ.id} className="mb-6 border rounded p-4 border-t">
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-1 text-left">Question</label>
                    <QuillEditor
                        value={subQ.text}
                        onChange={value => handleQuestionFieldChange('text', value, subQIdx)}
                        placeholder="Enter question"
                        minHeight={50}
                    />
                    {errors.subQuestions?.[subQIdx]?.text && <p className="text-red-500 text-xs italic">{errors.subQuestions[subQIdx].text}</p>}
                </div>
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-2 text-left">Options</label>
                    {errors.subQuestions?.[subQIdx]?.options && <p className="text-red-500 text-xs italic">{errors.subQuestions[subQIdx].options}</p>}
                    <div className="space-y-2">
                    {subQ.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleSetCorrect(subQIdx, oi)}
                            className={`w-8 h-8 rounded-full border ${subQ.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-white text-gray-700'} flex items-center justify-center`}
                            title="Mark as correct"
                        >
                            {String.fromCharCode(65 + oi)}
                        </button>
                        <input
                            type="text"
                            value={opt}
                            onChange={e => handleOptionChange(subQIdx, oi, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(subQIdx, oi)}
                            className="px-2 py-1 text-red-500 hover:text-red-700"
                            title="Remove option"
                        >
                            &times;
                        </button>
                        </div>
                    ))}
                    <div>
                        <button
                        type="button"
                        onClick={() => handleAddOption(subQIdx)}
                        className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                        + Add Option
                        </button>
                    </div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Correct: {String.fromCharCode(65 + subQ.correctAnswer)}</div>
                    {errors.subQuestions?.[subQIdx]?.correctAnswer && <p className="text-red-500 text-xs italic">{errors.subQuestions[subQIdx].correctAnswer}</p>}
                    <div>
                    <button
                        type="button"
                        onClick={() => handleRemoveSubQuestion(subQIdx)}
                        className="px-3 py-1 text-red-500 hover:text-red-700"
                    >
                        Remove Question
                    </button>
                    </div>
                </div>
              </div>
            ))}
            <button
                type="button"
                onClick={() => handleAddSubQuestion()}
                className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
                + Add Sub-Question
            </button>
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
