import ExcelJS from 'exceljs';

const getAnswer = (question) => {
  switch (question.type) {
    case 'mcq':
      return String.fromCharCode(65 + question.correctAnswer);
    case 'writing':
      return question.answer;
    case 'fill-in-the-blank':
      return String.fromCharCode(65 + question.correctAnswer);
    case 'reading':
      return String.fromCharCode(65 + question.correctAnswer);
    default:
      return '';
  }
};

const flattenQuestions = (questions) => {
  const flat = [];
  (questions || []).forEach(question => {
    if (question.type === 'reading' || question.type === 'fill-in-the-blank') {
      (question.questions || []).forEach(subQuestion => {
        flat.push({ ...subQuestion, type: question.type });
      });
    } else {
      flat.push(question);
    }
  });
  return flat;
};

export const exportToXlsx = async (projectOrTests) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Answers');

  const tests = projectOrTests.tests || [];
  if (tests.length === 0) return null;

  // ✅ Insert headers
  const headers = tests.map(test => test.name);
  sheet.addRow(headers);

  // ✅ Get questions per test
  const allTestsQuestions = tests.map(test => flattenQuestions(test.questions));

  const maxQuestions = Math.max(...allTestsQuestions.map(q => q.length));

  // ✅ Insert answer rows
  for (let i = 0; i < maxQuestions; i++) {
    const row = allTestsQuestions.map(questions =>
      i < questions.length ? getAnswer(questions[i]) : ''
    );
    sheet.addRow(row);
  }

  // ✅ Apply alignment to all cells (optional)
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'left',
        vertical: 'top',
      };
    });
  });

  // ✅ Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob(
    [buffer],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
};