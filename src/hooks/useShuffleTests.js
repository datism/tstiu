// Shuffle logic hook for generating tests
// Uses Zustand store for state
/**
 * @typedef {Object} Section
 * @property {string|number} id
 * @property {string} sectionName
 * @property {Array<Question>} questions
 *
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} text
 * @property {string} type - 'mcq' | 'filltheblank' | 'reading' | 'writing'
 * @property {Array<string>} options - for mcq
 * @property {number} correctAnswer - for mcq
 * @property {Array<SubQuestion>} questions - for filltheblank and reading
 *
 * @typedef {Object} SubQuestion
 * @property {string|number} id
 * @property {string} text
 * @property {Array<string>} options
 * @property {number} correctAnswer
 */
function getPermutations(arr, k) {
  const results = [];

  function helper(current, remaining) {
    if (current.length === k) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const rest = remaining.slice(0, i).concat(remaining.slice(i + 1));
      current.push(next);
      helper(current, rest);
      current.pop();
    }
  }

  helper([], arr);
  return results;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Shuffle options for a single MCQ-style question and update correctAnswer
function shuffleQuestionOptions(question) {
  if (!question.options || question.options.length === 0) {
    return question; // No options to shuffle
  }

  const originalCorrectOption = question.options[question.correctAnswer];
  const shuffledOptions = shuffleArray(question.options);
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectIndex
  };
}

// Shuffle options for all question types
function shuffleQuestion(question) {
  const type = question.type?.toLowerCase();

  // Only shuffle options for top-level MCQ questions.
  // Do NOT shuffle nested sub-questions or their options (per new requirement).
  if (type === 'mcq') {
    return shuffleQuestionOptions(question);
  }

  // For other types (reading, fill-in-the-blank, writing), return as-is.
  return question;
}

export function useShuffleTests() {
  // factorial and nPk helpers (for validation)
  const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
  const nPk = (n, k) => (n >= k ? factorial(n) / factorial(n - k) : 0);

  // --- Validate before generation ---
  // With the current behaviour we always generate a single test that contains all top-level questions
  // so validation only needs to check that a master test exists and has questions.
  function validateShuffle(masterTest) {
    if (!masterTest) return { valid: false, perms: 0, error: 'No master test provided.' };
    const masterQuestions = masterTest.questions || [];
    if (masterQuestions.length === 0) return { valid: false, perms: 0, error: 'Master test contains no questions.' };
    return { valid: true, perms: 1, error: '' };
  }

  // --- Generate tests using combinations ---
  function generateTests(masterTest) {
    // Generate a single test that contains the same number of top-level questions as the master test,
    // but with questions shuffled in order. Only MCQ options are shuffled.
    const masterQuestions = masterTest.questions || [];
    const shuffled = shuffleArray(masterQuestions).map(q => shuffleQuestion(q));

    const generated = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name: `Generated Test ${new Date().toISOString().split('T')[0]}`,
      createdDate: new Date().toISOString().split('T')[0],
      questions: shuffled,
      questionCount: shuffled.length
    };

    return [generated];
  }

  return { validateShuffle, generateTests };
}