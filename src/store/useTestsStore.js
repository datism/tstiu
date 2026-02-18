// Zustand store for standalone tests (replaces project-oriented store)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTestsStore = create(persist((set, get) => ({
  tests: [],
  selectedTest: null,
  setTests: (tests) => set({ tests }),
  selectTest: (test) => set({ selectedTest: test }),
  addTest: (test) => set(state => ({ tests: [...state.tests, test], selectedTest: test })),
  updateTest: (updatedTest) => set(state => ({
    tests: state.tests.map(t => t.id === updatedTest.id ? updatedTest : t),
    selectedTest: state.selectedTest && state.selectedTest.id === updatedTest.id ? updatedTest : state.selectedTest
  })),
  deleteTest: (testId) => set(state => ({
    tests: state.tests.filter(t => t.id !== testId),
    selectedTest: state.selectedTest && state.selectedTest.id === testId ? null : state.selectedTest
  })),
  addQuestion: (question) => set(state => {
    const { tests, selectedTest } = state;
    if (!selectedTest) return state;

    const newTests = tests.map(t => {
      if (t.id !== selectedTest.id) return t;
      const newQuestions = [...(t.questions || []), { ...question, id: question.id || Date.now() }];
      return { ...t, questions: newQuestions, questionCount: newQuestions.length };
    });

    const newSelected = newTests.find(t => t.id === selectedTest.id);
    return { tests: newTests, selectedTest: newSelected };
  }),
  deleteQuestion: (questionId, subQuestionId) => set(state => {
    const { tests, selectedTest } = state;
    if (!selectedTest) return state;

    const newTests = tests.map(t => {
      if (t.id !== selectedTest.id) return t;

      let newQuestions = (t.questions || []).map(q => {
        if (subQuestionId && q.id === questionId && Array.isArray(q.questions)) {
          const newSub = q.questions.filter(subQ => subQ.id !== subQuestionId);
          return { ...q, questions: newSub };
        }
        return q;
      });

      if (!subQuestionId) {
        newQuestions = newQuestions.filter(q => q.id !== questionId);
      }

      return { ...t, questions: newQuestions, questionCount: newQuestions.length };
    });

    const newSelected = newTests.find(t => t.id === selectedTest.id);
    return { tests: newTests, selectedTest: newSelected };
  }),
  updateQuestion: (updatedQuestion) => set(state => {
    const { tests, selectedTest } = state;
    if (!selectedTest) return state;

    const newTests = tests.map(t => {
      if (t.id !== selectedTest.id) return t;

      const newQuestions = (t.questions || []).map(q => {
        if (q.id === updatedQuestion.id) return updatedQuestion;
        // allow updating nested sub-questions inside a reading/fill question
        if (q.type === 'reading' || q.type === 'fill-in-the-blank') {
          const subIndex = (q.questions || []).findIndex(subQ => subQ.id === updatedQuestion.id);
          if (subIndex !== -1) {
            const newSub = [...q.questions];
            newSub[subIndex] = updatedQuestion;
            return { ...q, questions: newSub };
          }
        }
        return q;
      });

      return { ...t, questions: newQuestions };
    });

    const newSelected = newTests.find(t => t.id === selectedTest.id);
    return { tests: newTests, selectedTest: newSelected };
  }),
  updateTestName: (testId, newName) => set(state => ({
    tests: state.tests.map(t => t.id === testId ? { ...t, name: newName } : t),
    selectedTest: state.selectedTest && state.selectedTest.id === testId ? { ...state.selectedTest, name: newName } : state.selectedTest
  })),
}), { name: 'tests-store' }))

export default useTestsStore;
