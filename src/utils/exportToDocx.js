import { Document, Packer, Paragraph, TextRun, TabStopType, AlignmentType, PageOrientation } from 'docx';

import { saveAs } from 'file-saver';

const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_TOP = 259;
const MARGIN_BOTTOM = 878;
const MARGIN_LEFT = 490;
const MARGIN_RIGHT = 562;
const AvailablePageWidth = (PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT) * 0.9; // 90% of usable width

// Estimate text width for spacing. A standard 8.5" page with 1" margins has 6.5" of usable width.
// 6.5 inches * 1440 twips/inch = 9360 twips.
// A 12pt font character is roughly 120 twips wide on average.
function estimateTextWidthInTwips(text, fontSize = 12) {
  return text.length * (fontSize / 12) * 120;
}

function formatOption(q, fontSize) { 
  const options = Array.isArray(q.options) ? q.options : []; 
  const labeledOptions = options.map((opt, i) => ({
    label: String.fromCharCode(65 + i),
    text: opt
  }));
  const children = []; 
 
  if (options.length === 4) { 
    const widths = labeledOptions.map(opt => 
      estimateTextWidthInTwips(`${opt.label}. ${opt.text}`, fontSize / 2)
    ); 
    const oneColWidth = AvailablePageWidth / 4; 
    const twoColWidth = AvailablePageWidth / 2; 
 
    // Attempt 1 (4 options): 4 options on one line 
    const canFitOneLine = widths.every(w => w < oneColWidth);
 
    if (canFitOneLine) { 
      const tabStops = [ 
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth) }, 
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth * 2) }, 
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth * 3) }, 
      ]; 
      children.push(new Paragraph({ 
        children: [ 
          new TextRun({ text: `${labeledOptions[0].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: `${labeledOptions[0].text}\t`, size: fontSize }),
          new TextRun({ text: `${labeledOptions[1].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: `${labeledOptions[1].text}\t`, size: fontSize }),
          new TextRun({ text: `${labeledOptions[2].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: `${labeledOptions[2].text}\t`, size: fontSize }),
          new TextRun({ text: `${labeledOptions[3].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: labeledOptions[3].text, size: fontSize }),
        ], 
        tabStops, 
      })); 
      // Attempt 2 (4 options): 2x2 grid 
    } else if ( 
        (widths[0] < twoColWidth && widths[1] < twoColWidth) && 
        (widths[2] < twoColWidth && widths[3] < twoColWidth)) { 
      const tabStops = [{ type: TabStopType.LEFT, position: Math.floor(twoColWidth) }];
      children.push(new Paragraph({ 
        children: [ 
          new TextRun({ text: `${labeledOptions[0].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: `${labeledOptions[0].text}\t`, size: fontSize }),
          new TextRun({ text: `${labeledOptions[1].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: labeledOptions[1].text, size: fontSize }),
        ], 
        tabStops, 
      })); 
      children.push(new Paragraph({ 
        children: [ 
          new TextRun({ text: `${labeledOptions[2].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: `${labeledOptions[2].text}\t`, size: fontSize }),
          new TextRun({ text: `${labeledOptions[3].label}. `, size: fontSize, bold: true }),
          new TextRun({ text: labeledOptions[3].text, size: fontSize }),
        ], 
        tabStops, 
      })); 
      // Fallback (4 options): 1 option per line 
    } else { 
      labeledOptions.forEach(opt => { 
        children.push(new Paragraph({ 
          children: [
            new TextRun({ text: `${opt.label}. `, size: fontSize, bold: true }),
            new TextRun({ text: opt.text, size: fontSize })
          ] 
        })); 
      }); 
    } 
  } else if (options.length > 1 && options.length < 4) { 
      const widths = labeledOptions.map(opt => 
        estimateTextWidthInTwips(`${opt.label}. ${opt.text}`, fontSize / 2)
      ); 
      const colWidth = AvailablePageWidth / options.length; 
 
      // Attempt 1 (2-3 options): All on one line 
      const canFitOneLine = widths.every(w => w < colWidth); 
 
      if (canFitOneLine) { 
        const tabStops = Array.from({ length: options.length - 1 }, (_, i) => ({ 
          type: TabStopType.LEFT, 
          position: Math.floor(colWidth * (i + 1)), 
        }));
        const textRuns = [];
        labeledOptions.forEach((opt, i) => {
          textRuns.push(new TextRun({ text: `${opt.label}. `, size: fontSize, bold: true }));
          textRuns.push(new TextRun({ 
            text: opt.text + (i < labeledOptions.length - 1 ? '\t' : ''), 
            size: fontSize 
          }));
        });
        children.push(new Paragraph({ 
          children: textRuns, 
          tabStops, 
        })); 
      } else { 
        // Fallback (2-3 options): 1 option per line 
        labeledOptions.forEach(opt => { 
          children.push(new Paragraph({ 
            children: [
              new TextRun({ text: `${opt.label}. `, size: fontSize, bold: true }),
              new TextRun({ text: opt.text, size: fontSize })
            ] 
          })); 
        }); 
      } 
  } else { 
    // For other counts, one option per line 
    labeledOptions.forEach(opt => { 
      children.push(new Paragraph({ 
        children: [
          new TextRun({ text: `${opt.label}. `, size: fontSize, bold: true }),
          new TextRun({ text: opt.text, size: fontSize })
        ], 
      })); 
    }); 
  } 
  return children; 
}

export function parseQuillHTML(quillHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(quillHTML, "text/html");
  const paragraphs = [];

  doc.body.childNodes.forEach((node) => {
    const parsed = parseNode(node);
    if (!parsed) return;
    if (Array.isArray(parsed)) paragraphs.push(...parsed);
    else paragraphs.push(parsed);
  });

  return paragraphs;
}

function parseNode(node, inherited = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.replace(/\t/g, "    "); // indent tabs
    if (!text.trim()) return null;
    return new TextRun({ text, ...inherited });
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const tag = node.tagName.toLowerCase();
  const formatting = { ...inherited };

  // Tag-based formatting
  if (tag === "strong" || tag === "b") formatting.bold = true;
  if (tag === "em" || tag === "i") formatting.italics = true;
  if (tag === "u") formatting.underline = { color: "auto" };

  switch (tag) {
    case "p": {
      const runs = parseChildren(node, formatting);
      return new Paragraph({
        children: runs.length ? runs : [new TextRun("")],
      });
    }

    case "br":
      return new TextRun({ text: "\n" });

    case "a":
      return new TextRun({
        text: node.textContent || "",
        style: "Hyperlink",
        link: node.getAttribute("href") || "",
        ...formatting,
      });

    default:
      return parseChildren(node, formatting);
  }
}

function parseChildren(node, inherited) {
  const runs = [];
  node.childNodes.forEach((child) => {
    const parsed = parseNode(child, inherited);
    if (!parsed) return;
    if (Array.isArray(parsed)) runs.push(...parsed);
    else if (parsed instanceof Paragraph && parsed.children)
      runs.push(...parsed.children);
    else runs.push(parsed);
  });
  return runs;
}

function stripOuterP(html) {
  const trimmed = html.trim();

  // Remove ONLY if wrapped by exactly one <p>
  if (trimmed.startsWith("<p>") && trimmed.endsWith("</p>")) {
    const inner = trimmed.slice(3, -4); // Remove <p> and </p>
    const hasInnerP = /<p[\s>]/i.test(inner);
    if (hasInnerP) {
      return { html: html, hasInnerP };
    } else {
      return { html: inner, hasInnerP };
    }

  }

  // No outer <p>
  return { html, hasInnerP: /<p[\s>]/i.test(html) };
}

export async function exportTestDocx({ test = null, filename = 'export.docx', returnBlob = false }) {
  // Use fixed defaults
  const fontFamily = 'Times New Roman';
  const fontSize = 24; // docx uses half-points; we'll convert later if needed
  // Build all children (header paragraphs + question blocks)
  const allChildren = [];

  // Body: questions
  if (!test) throw new Error('No test provided');
  const questions = Array.isArray(test.questions) ? test.questions : [];
  if (!Array.isArray(questions)) throw new Error('Test object must include a questions array');
  let qIdx = 0;

  // Optional test-level instruction
  if (test.instruction) {
    allChildren.push(new Paragraph({
      children: [new TextRun({ text: test.instruction, bold: true, italics: true, size: fontSize })],
    }));
  }

  questions.forEach((q) => {
    if (q.type === 'mcq') {
      qIdx += 1;

      let pStripeedRes = stripOuterP(q.text);
      if (pStripeedRes.hasInnerP) {
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
        ]}));
        allChildren.push(
          ...parseQuillHTML(pStripeedRes.html)
        );
      } else {
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
          ...parseQuillHTML(pStripeedRes.html)
        ]}));
      }
      allChildren.push(...formatOption(q, fontSize))
    } else if (q.type === 'reading') {
      if (q.title) {
        allChildren.push(new Paragraph({
          children: [new TextRun({ text: q.title, bold: true, size: fontSize })],
          alignment: AlignmentType.CENTER,
        }));
      }
      if (q.passage) {
        allChildren.push(...parseQuillHTML(q.passage));
      }
      (q.questions || []).forEach((subQ) => {
        qIdx += 1;

        let pStripeedRes = stripOuterP(subQ.text);
        if (pStripeedRes.hasInnerP) {
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
          ]}));
          allChildren.push(
            ...parseQuillHTML(pStripeedRes.html)
          );
        } else {
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
            ...parseQuillHTML(pStripeedRes.html)
          ]}));
        }
        allChildren.push(...formatOption(subQ, fontSize));
      });
    } else if (q.type === 'fill-in-the-blank') {
      if (q.title) {
        allChildren.push(new Paragraph({
          children: [new TextRun({ text: q.title, bold: true, size: fontSize })],
          alignment: AlignmentType.CENTER,
        }));
      }
      if (q.passage) {
        let blankCounter = qIdx + 1;
        const passageWithBlanks = q.passage.replace(/\{blank\}/g, () => {
          const id = `${blankCounter++}`;
          return `<b>(${id}) _________</b>`;
        });

        allChildren.push(...parseQuillHTML(passageWithBlanks));
      }
      (q.questions || []).forEach((subQ) => {
        qIdx += 1;
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
        ]}));
        allChildren.push(...formatOption(subQ, fontSize));
      });
    } else if (q.type === 'writing') {
      qIdx += 1;
      allChildren.push(new Paragraph({ children: [
        new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
        ...parseQuillHTML(q.text)
      ]}));
    }
  });

  try {
    const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: fontFamily, size: fontSize }
        }
      ]
    },
    sections: [
      {
        properties: {
                page: {
                    size: {
                        orientation: PageOrientation.PORTRAIT,
                        width: PAGE_WIDTH, 
                        height: PAGE_HEIGHT,
                    },
                    margin: {
                        top: MARGIN_TOP,
                        bottom: MARGIN_BOTTOM,
                        left: MARGIN_LEFT,
                        right: MARGIN_RIGHT,
                    },
                },
              },
        children: allChildren
      }
    ]
  });

    const blob = await Packer.toBlob(doc);
    if (returnBlob) {
      return blob;
    } else {
      saveAs(blob, filename);
    }
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    throw err;
  }
}

export default exportTestDocx;
