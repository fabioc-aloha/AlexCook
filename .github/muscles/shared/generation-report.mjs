/**
 * @type muscle
 * @lifecycle stable
 * @muscle generation-report
 * @inheritance inheritable
 * @description Shared generation QA report helper for generate-*.js scripts (GP1)
 * @version 1.0.0
 * @currency 2026-04-26
 *
 * Generation scripts call report.record() after each Replicate call to log the
 * prompt+output pair. At the end, report.write() emits .generation-report.json
 * so the LLM can spot-check output quality against prompt intent.
 *
 * Usage:
 *   import { createGenerationReport } from './.github/muscles/shared/generation-report.mjs';
 *   const report = createGenerationReport('generate-readme-banners');
 *
 *   // After each generation:
 *   report.record({
 *     id: 'rocket-code',
 *     model: 'ideogram-ai/ideogram-v2',
 *     prompt: promptText,
 *     outputPath: 'assets/banner-rocket-code.png',
 *     params: { width: 1440, height: 480 },
 *   });
 *
 *   // After all generations:
 *   report.write('assets/');
 */

import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} GenerationEntry
 * @property {string} id - Asset identifier
 * @property {string} model - Replicate model used
 * @property {string} prompt - Full prompt text sent to the model
 * @property {string} outputPath - Where the output was saved
 * @property {Object} [params] - Model parameters (width, height, seed, etc.)
 * @property {'pending'|'ok'|'warning'|'rejected'} [qaStatus] - Set by LLM reviewer
 * @property {string} [qaNote] - LLM reviewer's note
 */

/**
 * Create a generation report collector.
 * @param {string} scriptName - Name of the generation script (e.g., 'generate-readme-banners')
 * @returns {{ record: Function, write: Function, entries: GenerationEntry[] }}
 */
export function createGenerationReport(scriptName) {
  /** @type {GenerationEntry[]} */
  const entries = [];
  const startTime = Date.now();

  return {
    entries,

    /**
     * Record a generation prompt+output pair.
     * @param {GenerationEntry} entry
     */
    record(entry) {
      entries.push({
        ...entry,
        qaStatus: 'pending',
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Get summary counts.
     */
    summary() {
      return {
        total: entries.length,
        pending: entries.filter(e => e.qaStatus === 'pending').length,
        ok: entries.filter(e => e.qaStatus === 'ok').length,
        warning: entries.filter(e => e.qaStatus === 'warning').length,
        rejected: entries.filter(e => e.qaStatus === 'rejected').length,
      };
    },

    /**
     * Write the report as .generation-report.json.
     * @param {string} outputDir - Directory to write the report in
     * @returns {string} Path to the written report file
     */
    write(outputDir) {
      const report = {
        script: scriptName,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        summary: this.summary(),
        qaChecklist: [
          'Subject matches prompt description',
          'Text is legible and correctly spelled',
          'Brand colors and style are consistent',
          'Resolution meets target dimensions',
          'No AI artifacts (extra fingers, warped text, merged objects)',
          'Face/character consistency maintained (if applicable)',
          'Output suitable for intended use-case',
        ],
        entries,
      };

      const reportPath = path.join(outputDir, `${scriptName}.generation-report.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
      return reportPath;
    },
  };
}
