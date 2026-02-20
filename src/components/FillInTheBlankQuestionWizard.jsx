
import React, { useState, useEffect } from 'react';
import { useTestsStore } from '../store/useTestsStore';
import QuillEditor from './QuillEditor';
import { validateFillInTheBlankQuestion } from '../utils/validation';

export default function FillInTheBlankQuestionWizard({ onClose, question }) {
  const [newQuestion, setNewQuestion] = useState(
    question || {
      id: Date.now(),
      title: '',
      passage: '',
      questions: [
        {
          id: Date.now(),
          options: ['', ''],
          correctAnswer: -1
        }
      ],
      type: 'fill-in-the-blank'
    }
  );
  const [errors, setErrors] = useState({});
  const { addQuestion, updateQuestion } = useTestsStore();
  const isEditing = !!question && !question.isNew;

  // Effect to synchronize sub-questions with the number of blanks in the passage
  useEffect(() => {
    const blankCount = (newQuestion.passage.match(/{blank}/g) || []).length;
    const currentSubQuestionCount = newQuestion.questions.length;

    if (blankCount !== currentSubQuestionCount) {
      setNewQuestion(prevQuestion => {
        const updatedQuestions = [...prevQuestion.questions];
        if (blankCount > currentSubQuestionCount) {
          // Add new sub-questions if there are more blanks
          for (let i = 0; i < blankCount - currentSubQuestionCount; i++) {
            updatedQuestions.push({
              id: Date.now() + Math.floor(Math.random() * 10000) + i,
              options: ['', ''],
              correctAnswer: -1
            });
          }
        } else if (blankCount < currentSubQuestionCount) {
          // Remove excess sub-questions if there are fewer blanks
          updatedQuestions.splice(blankCount);
        }
        return { ...prevQuestion, questions: updatedQuestions };
      });
    }
  }, [newQuestion.passage, newQuestion.questions.length]);


  const handleSave = () => {
    const validationErrors = validateFillInTheBlankQuestion(newQuestion);
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
                correctAnswer = -1;
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

  // Removed handleAddSubQuestion and handleRemoveSubQuestion as they are now controlled by the passage blanks

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full flex justify-center items-start pt-12">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditing ? 'Edit Fill-in-the-Blank Question' : 'Add Fill-in-the-Blank Question'}</h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Title (Optional)</label>
                <input
                    type="text"
                    value={newQuestion.title}
                    onChange={e => handleQuestionFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    placeholder="Enter title for fill-in-the-blank passage"
                />
            </div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Passage (Use &#123;blank&#125; for blanks)</label>
                <QuillEditor
                    value={newQuestion.passage || ''}
                    onChange={value => handleQuestionFieldChange('passage', value)}
                    placeholder="Paste the passage here, use {blank} for fill-in-the-blank spots"
                    minHeight={150}
                />
                {errors.passage && <p className="text-red-500 text-xs mt-1">{errors.passage}</p>}
            </div>

            {errors.questions && <p className="text-red-500 text-xs mt-1 mb-3">{errors.questions}</p>}
            {newQuestion.questions.map((subQ, subQIdx) => (
              <div key={subQ.id} className="mb-6 border rounded p-4 border-t">
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-1 text-left">Blank {subQIdx + 1} Options</label>
                </div>
                <div className="mb-3">
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
                    {errors.subQuestions?.[subQIdx]?.options && <p className="text-red-500 text-xs mt-1">{errors.subQuestions[subQIdx].options}</p>}
                    {errors.subQuestions?.[subQIdx]?.correctAnswer && <p className="text-red-500 text-xs mt-1">{errors.subQuestions[subQIdx].correctAnswer}</p>}
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
              </div>
            ))}
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
