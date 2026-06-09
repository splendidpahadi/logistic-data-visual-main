const SAMPLE_SIZE = 10;

/**
 * Parses a CSV string into an array of row objects.
 * Returns { columns, rows, rowCount, sample, error }
 */
export function parseCSV(csvText) {
  try {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { error: 'CSV must have at least a header row and one data row.' };
    }

    const columns = splitCSVLine(lines[0]);
    if (columns.length === 0) {
      return { error: 'No columns found in the CSV header.' };
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = splitCSVLine(line);
      const row = {};
      columns.forEach((col, idx) => {
        const raw = values[idx] ?? '';
        // Coerce to number if possible
        const num = Number(raw);
        row[col] = raw !== '' && !isNaN(num) ? num : raw;
      });
      rows.push(row);
    }

    if (rows.length === 0) {
      return { error: 'No data rows found in the CSV.' };
    }

    return {
      columns,
      rows,
      rowCount: rows.length,
      sample: rows.slice(0, SAMPLE_SIZE),
    };
  } catch (err) {
    return { error: `Failed to parse CSV: ${err.message}` };
  }
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
