import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import exportTestDocx from '../utils/exportToDocx';
import { exportToXlsx } from '../utils/exportToXlsx';
import { useTestsStore } from '../store/useTestsStore';

export default function ExportModal({ open, onClose, test }) {
  const { tests } = useTestsStore();
  const [instructions, setInstructions] = useState({});
  const [exportToExcel, setExportToExcel] = useState(false);
  const [exportToJson, setExportToJson] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset instructions when modal opens
      setInstructions({});
      setExportToExcel(false);
      setExportToJson(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[720px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Export Test to .docx</h3>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900"><X /></button>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportToExcel}
              onChange={(e) => setExportToExcel(e.target.checked)}
              className="mr-2"
            />
            <span>Export answers to Excel</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportToJson}
              onChange={(e) => setExportToJson(e.target.checked)}
              className="mr-2"
            />
            <span>Export to JSON</span>
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={async () => {
              if (test) { // Handle single test export
                const zip = new JSZip();
                const testWithInstructions = {
                  ...test,
                  questions: test.questions || [],
                  instruction: instructions[test.id] || ''
                };
                if (!Array.isArray(testWithInstructions.questions) || testWithInstructions.questions.length === 0) {
                  return alert('Selected test has no questions to export.');
                }
                const projectName = (test?.name || 'test').replace(/ /g, '_');
                const testName = (test?.name || 'test').replace(/ /g, '_');
                const docxFilename = `${projectName}_${testName}.docx`;
                const docxBlob = await exportTestDocx({ test: testWithInstructions, returnBlob: true });
                if (docxBlob) {
                  zip.file(docxFilename, docxBlob);
                }
                if (exportToExcel) {
                  const xlsxBlob = await exportToXlsx({ tests: [test] });
                  if (xlsxBlob) {
                    zip.file(`${projectName}_${testName}_answers.xlsx`, xlsxBlob);
                  }
                }
                if (exportToJson) {
                  const jsonBlob = new Blob([JSON.stringify(test, null, 2)], { type: 'application/json' });
                  zip.file(`${projectName}_${testName}.json`, jsonBlob);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                saveAs(zipBlob, `${projectName}_${testName}.zip`);
              } else { // Handle "Export All"
                const allTests = tests || [];
                if (allTests.length === 0) {
                  return alert('No tests to export.');
                }
                const zip = new JSZip();
                for (const singleTest of allTests) {
                  const testWithInstructions = {
                    ...singleTest,
                    questions: singleTest.questions || [],
                    instruction: instructions[singleTest.id] || ''
                  };
                  if (!Array.isArray(testWithInstructions.questions) || testWithInstructions.questions.length === 0) {
                    console.warn(`Skipping test "${singleTest.name}" because it has no questions.`);
                    continue;
                  }
                  const projectName = 'tests_collection';
                  const testName = (singleTest?.name || 'test').replace(/ /g, '_');
                  const filename = `${projectName}_${testName}.docx`;
                  const blob = await exportTestDocx({ test: testWithInstructions, returnBlob: true });
                  if (blob) {
                    zip.file(filename, blob);
                  }
                }

                if (exportToExcel) {
                  const xlsxBlob = await exportToXlsx({ tests: allTests });
                  if (xlsxBlob) {
                    zip.file(`tests_collection_answers.xlsx`, xlsxBlob);
                  }
                }

                if (exportToJson) {
                  const jsonBlob = new Blob([JSON.stringify(allTests, null, 2)], { type: 'application/json' });
                  zip.file(`tests_collection.json`, jsonBlob);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                saveAs(zipBlob, `tests_collection_all_tests.zip`);
              }

              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          ><Download size={16} /> Export</button>
        </div>
      </div>
    </div>
  );
}
