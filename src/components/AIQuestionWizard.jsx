import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTestsStore } from '../store/useTestsStore';
import QuillEditor from './QuillEditor';
import MCQQuestionWizard from './MCQQuestionWizard';
import ReadingQuestionWizard from './ReadingQuestionWizard';
import WritingQuestionWizard from './WritingQuestionWizard';
import FillInTheBlankQuestionWizard from './FillInTheBlankQuestionWizard';

export default function AIQuestionWizard({ open, onClose, defaultType = 'mcq' }) {
  const selectedTest = useTestsStore(state => state.selectedTest);
  const [apiKey, setApiKey] = useState('');
  const [type, setType] = useState(defaultType);
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wizard, setWizard] = useState(null);

  if (!open) return null;

  async function handleGenerate() {
    setError('');
    if (!apiKey) return setError('Please provide your OpenAI API key.');
    if (!raw.trim()) return setError('Enter the unformatted question text.');
    setLoading(true);
    try {
      // Build schema based on question type
      const getSchema = (qType) => {
        if (qType === 'mcq') {
          return {
            type: 'object',
            properties: {
              text: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
            },
            required: ['text', 'options'],
          };
        } else if (qType === 'fill-in-the-blank') {
          return {
            type: 'object',
            properties: {
              title: { type: 'string' },
              passage: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    options: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['options'],
                }
              }
            },
            required: ['passage', 'questions'],

          };
        } else if (qType === 'reading') {
          return {
            type: 'object',
            properties: {
              title: { type: 'string' },
              passage: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['options'],
                }
              }
            },
            required: ['passage', 'questions'],
          };
        } else if (qType === 'writing') {
          return {
            type: 'object',
            properties: {
              text: { type: 'string' }
            },
            required: ['text'],
          };
        }
      };

      const getSystemPrompt = (qType) => {
        if (qType === 'mcq') {
            return `You are an MCQ question converter. The input is HTML. Extract and return a JSON object following these rules: 
            1. TEXT: Extract the question content as HTML. Remove the question number. Preserve all remaining HTML and formatting.
            2. OPTIONS: Extract only the answer option values. Remove leading labels like A. B. C. D. Strip any extra whitespace;.
            3. Return valid JSON only. No correct answer, no explanation, no markdown.`
        } else if (qType === 'fill-in-the-blank') {
            return `You are a fill-in-the-blank exercise converter. The input is HTML. Extract and return a JSON object following these rules:
            1. TITLE: Extract the title as HTML. Do not auto-generate. If none exists, use an empty string.
            2. PASSAGE: Extract the passage as HTML. Replace every blank pattern like (1) ______, [1], ___(1)___ with exactly {blank}. Do not include the title.
            3. QUESTIONS: For each question, extract only the option values as HTML. Remove leading labels like A. B. C. D. or 1. 2. 3. 4. or (a) (b). Order questions to match blank order.
            4. Return valid JSON only. No explanation, no correct answer, no markdown, no extra text.`
        } else if (qType === 'reading') {
            return `You are a reading comprehension question converter. The input is HTML. Extract and return a JSON object following these rules:
            1. TITLE: Extract the title as HTML. Do not auto-generate. If none exists, use an empty string.
            2. PASSAGE: Extract only the passage paragraphs as HTML. Do not include any questions.
            3. QUESTIONS: For each question, extract the question text as HTML (remove the question number e.g. \"Question 43:\") and extract only the option values as HTML (remove leading labels like A. B. C. D. and strip extra whitespace).
            4. Return valid JSON only. No correct answer, no explanation, no markdown.`
        } else if (qType === 'writing') {
            return `You are a writing exercise converter. The input is HTML. Extract and return a JSON object following these rules:
            1. TEXT: Extract the full exercise content as HTML. Preserve all HTML tags and formatting (remove the question number e.g. \"Question 43:\").
            2. Return valid JSON only. No correct answer, no explanation, no markdown.`
        }
      }

      const targetType = type === 'auto' ? 'mcq' : type;
      const schema = getSchema(targetType);
      const system = getSystemPrompt(targetType);
      const userPrompt =`${raw}`;

      const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': `${apiKey}`,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
                { text: system }
            ]
          },
          contents: [
            { 
                role: 'user', 
                parts: [
                    { text: userPrompt }
                ] 
            }
          ],
          generation_config: {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Google AI error: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      const content = data.candidates[0].content.parts[0].text || '';
      const parsed = JSON.parse(content);
      parsed.type = targetType;

      // Ensure top-level id and sub-question ids exist: use string timestamps
      if (!parsed.id) parsed.id = String(Date.now()) + '-' + Math.floor(Math.random() * 1000);
      if (Array.isArray(parsed.questions)) {
        parsed.questions = parsed.questions.map((sq, i) => ({ id: sq.id || String(Date.now()) + '-' + Math.floor(Math.random() * 1000), ...sq }));
      }

      // prepare wizard with parsed content (prefill forms)
      const q = { ...parsed, id: parsed.id, isNew: true };
      setWizard({ type: q.type, question: q });
      setRaw('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate question');
    } finally {
      setLoading(false);
    }
    }

    // (wizard is rendered below alongside the AI modal)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto py-12 bg-black bg-opacity-40">
      <div className="w-full max-w-2xl bg-white rounded shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generate Question with AI</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm">Google AI API Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <div className="text-xs text-gray-500 mt-1">Keys entered here are stored only in your browser session.</div>
          </div>

          <div>
            <label className="block text-sm">Question Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="mcq">Multiple Choice</option>
              <option value="reading">Reading (passage + sub-questions)</option>
              <option value="writing">Writing</option>
              <option value="fill-in-the-blank">Fill in the blank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm">Raw question</label>
            <div className="border rounded overflow-hidden">
              <QuillEditor value={raw} onChange={setRaw} placeholder="Paste your messy question here." minHeight={150} />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button onClick={handleGenerate} disabled={loading || !selectedTest} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">{loading ? 'Generating...' : 'Generate'}</button>
          </div>
        </div>
        </div>

          {wizard && wizard.type === 'mcq' && (
            <MCQQuestionWizard
              question={wizard.question}
              onClose={() => { setWizard(null); onClose && onClose(); }}
            />
          )}
          {wizard && wizard.type === 'reading' && (
            <ReadingQuestionWizard
              question={wizard.question}
              onClose={() => { setWizard(null); onClose && onClose(); }}
            />
          )}
          {wizard && wizard.type === 'writing' && (
            <WritingQuestionWizard
              question={wizard.question}
              onClose={() => { setWizard(null); onClose && onClose(); }}
            />
          )}
          {wizard && wizard.type === 'fill-in-the-blank' && (
            <FillInTheBlankQuestionWizard
              question={wizard.question}
              onClose={() => { setWizard(null); onClose && onClose(); }}
            />
          )}
        
    </div>
  );
}
