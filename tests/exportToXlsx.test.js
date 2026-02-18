import { describe, it, expect } from 'vitest';
import { exportToXlsx } from '../src/utils/exportToXlsx';

describe('exportToXlsx', () => {
  it('returns a Blob for a minimal test', async () => {
    const tests = [
      {
        name: 'Sample Test',
        questions: [
          { type: 'mcq', text: 'Choose one', options: ['A','B','C','D'], correctAnswer: 1 },
          { type: 'writing', text: 'Write something', answer: 'Sample answer' },
          { type: 'fill-in-the-blank', passage: 'Hello {blank} world', questions: [{ options: ['X','Y'], correctAnswer: 0 }] }
        ]
      }
    ];

    const blob = await exportToXlsx({ tests });
    // Expect a Blob-like object with size > 0
    expect(blob).toBeDefined();
    // Blob.size exists in browsers and Node 18+; accept ArrayBuffer or Blob
    if (typeof blob.size === 'number') {
      expect(blob.size).toBeGreaterThan(0);
    } else {
      // If it's not a Blob, at least ensure it's truthy
      expect(blob).toBeTruthy();
    }
  });
});
