'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TimelineEntry {
  _id: string;
  characterId: {
    _id: string;
    name: string;
  };
  outfitId: {
    _id: string;
    name: string;
    description?: string;
    items: Array<{
      itemId: {
        name: string;
        category: string;
      };
      layer: number;
    }>;
  };
  chapter?: number | string;
  scene?: number | string;
  page?: number;
  notes?: string;
  context?: string;
}

interface TimelineExportProps {
  entries: TimelineEntry[];
  title?: string;
}

export function TimelineExport({ entries, title = 'Timeline Report' }: TimelineExportProps) {
  const [exporting, setExporting] = useState(false);

  const generateMarkdown = () => {
    let markdown = `# ${title}\n\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += `Total Entries: ${entries.length}\n\n`;
    markdown += `---\n\n`;

    // Group by chapter
    const byChapter = entries.reduce((acc, entry) => {
      const chapter = String(entry.chapter || 'Unassigned');
      if (!acc[chapter]) acc[chapter] = [];
      acc[chapter].push(entry);
      return acc;
    }, {} as Record<string, TimelineEntry[]>);

    // Sort chapters - try numeric first, fallback to string
    const sortedChapters = Object.keys(byChapter).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    sortedChapters.forEach((chapterNum) => {
      const chapterEntries = byChapter[Number(chapterNum)];
      markdown += `## Chapter ${chapterNum}\n\n`;

      // Sort by scene within chapter
      const sortedEntries = chapterEntries.sort((a, b) => {
        const sceneA = typeof a.scene === 'number' ? a.scene : parseInt(String(a.scene)) || 0;
        const sceneB = typeof b.scene === 'number' ? b.scene : parseInt(String(b.scene)) || 0;
        if (sceneA && sceneB) return sceneA - sceneB;
        if (a.page && b.page) return a.page - b.page;
        return 0;
      });

      sortedEntries.forEach((entry) => {
        markdown += `### ${entry.characterId.name}`;
        if (entry.scene) markdown += ` - Scene ${entry.scene}`;
        if (entry.page) markdown += ` - Page ${entry.page}`;
        markdown += `\n\n`;

        markdown += `**Outfit:** ${entry.outfitId.name}\n\n`;

        if (entry.outfitId.description) {
          markdown += `*${entry.outfitId.description}*\n\n`;
        }

        markdown += `**Items:**\n`;
        const sortedItems = entry.outfitId.items.sort((a, b) => a.layer - b.layer);
        sortedItems.forEach((item) => {
          markdown += `- Layer ${item.layer}: ${item.itemId.name} (${item.itemId.category})\n`;
        });
        markdown += `\n`;

        if (entry.notes) {
          markdown += `**Notes:** ${entry.notes}\n\n`;
        }

        if (entry.context) {
          markdown += `**Context:** ${entry.context}\n\n`;
        }

        markdown += `---\n\n`;
      });
    });

    return markdown;
  };

  const generatePDF = async () => {
    try {
      setExporting(true);

      // Dynamic import for PDF generation
      const html2pdf = (await import('html2pdf.js')).default;

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #9ca3af; padding-bottom: 5px; }
            h3 { color: #4b5563; margin-top: 20px; }
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
            .outfit { margin-bottom: 30px; padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; }
            .outfit-name { font-weight: bold; color: #1f2937; font-size: 18px; }
            .outfit-desc { font-style: italic; color: #6b7280; margin: 5px 0; }
            .items { margin: 10px 0; }
            .item { margin: 5px 0 5px 20px; color: #374151; }
            .notes { background: #fef3c7; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .context { background: #dbeafe; padding: 10px; margin: 10px 0; border-radius: 4px; }
            .chapter { page-break-after: always; }
            .chapter:last-child { page-break-after: auto; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Entries: ${entries.length}</p>
          </div>
          ${Object.entries(
            entries.reduce((acc, entry) => {
              const chapter = String(entry.chapter || 'Unassigned');
              if (!acc[chapter]) acc[chapter] = [];
              acc[chapter].push(entry);
              return acc;
            }, {} as Record<string, TimelineEntry[]>)
          )
            .sort((a, b) => {
              const numA = parseInt(a[0]);
              const numB = parseInt(b[0]);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              return a[0].localeCompare(b[0]);
            })
            .map(([chapterNum, chapterEntries]) => {
              const sortedEntries = chapterEntries.sort((a, b) => {
                const sceneA = typeof a.scene === 'number' ? a.scene : parseInt(String(a.scene)) || 0;
                const sceneB = typeof b.scene === 'number' ? b.scene : parseInt(String(b.scene)) || 0;
                if (sceneA && sceneB) return sceneA - sceneB;
                if (a.page && b.page) return a.page - b.page;
                return 0;
              });

              return `
                <div class="chapter">
                  <h2>Chapter ${chapterNum}</h2>
                  ${sortedEntries
                    .map(
                      (entry) => `
                    <div class="outfit">
                      <h3>
                        ${entry.characterId.name}
                        ${entry.scene ? ` - Scene ${entry.scene}` : ''}
                        ${entry.page ? ` - Page ${entry.page}` : ''}
                      </h3>
                      <div class="outfit-name">${entry.outfitId.name}</div>
                      ${entry.outfitId.description ? `<div class="outfit-desc">${entry.outfitId.description}</div>` : ''}
                      <div class="items">
                        <strong>Items:</strong>
                        ${entry.outfitId.items
                          .sort((a, b) => a.layer - b.layer)
                          .map(
                            (item) =>
                              `<div class="item">Layer ${item.layer}: ${item.itemId.name} (${item.itemId.category})</div>`
                          )
                          .join('')}
                      </div>
                      ${entry.notes ? `<div class="notes"><strong>Notes:</strong> ${entry.notes}</div>` : ''}
                      ${entry.context ? `<div class="context"><strong>Context:</strong> ${entry.context}</div>` : ''}
                    </div>
                  `
                    )
                    .join('')}
                </div>
              `;
            })
            .join('')}
        </body>
        </html>
      `;

      // Create temporary div
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const opt = {
        margin: 0.5,
        filename: `${title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(tempDiv).save();
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try the Markdown export instead.');
    } finally {
      setExporting(false);
    }
  };

  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-600 text-center">No timeline entries to export</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Timeline Report</h3>
      <p className="text-sm text-gray-600 mb-4">
        Export the timeline report as a PDF for printing or Markdown for manuscript integration.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={generatePDF}
          disabled={exporting}
          className="flex-1"
        >
          {exporting ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Generating PDF...
            </>
          ) : (
            <>
              <span className="mr-2">📄</span>
              Export as PDF
            </>
          )}
        </Button>

        <Button
          onClick={downloadMarkdown}
          variant="secondary"
          className="flex-1"
        >
          <span className="mr-2">📝</span>
          Export as Markdown
        </Button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">Export includes:</p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
          <li>All timeline entries grouped by chapter</li>
          <li>Character names and outfit details</li>
          <li>Scene/page numbers and context</li>
          <li>Complete item lists with layers</li>
          <li>Notes and additional information</li>
        </ul>
      </div>
    </Card>
  );
}
