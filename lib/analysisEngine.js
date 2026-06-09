/**
 * Executes an analysis plan against the full dataset.
 *
 * Visualization contract (matches the spec):
 *   "bar"   → table + bar chart   (rankings, comparisons, top-N)
 *   "line"  → line chart only     (trends over time)
 *   "pie"   → pie chart only      (distributions, proportions)
 *   "table" → table only          (summaries, lists, raw rows)
 *   "none"  → no table or chart   (single-value / text answers)
 */
export function executeAnalysis(rows, columns, plan) {
  if (!plan || !rows || rows.length === 0) {
    return { table: null, chart: null, summary: null };
  }

  const { visualization, groupBy, metric, filter, column, sortDir, limit, needsRawData } = plan;

  let workingRows = applyFilter(rows, filter);

  if (workingRows.length === 0) {
    return { table: null, chart: null, summary: 'No data matched the filter criteria.' };
  }

  // Raw row listing (no aggregation)
  if (!groupBy || needsRawData) {
    const cap = limit || 50;
    return { table: workingRows.slice(0, cap), chart: null, summary: null };
  }

  // Aggregated path
  const entries = buildGroupedEntries(workingRows, groupBy, metric, column, sortDir, limit);
  const valueKey = getMetricLabel(metric, column);

  if (visualization === 'none') {
    return { table: null, chart: null, summary: null };
  }

  if (visualization === 'table') {
    return { table: entries, chart: null, summary: null };
  }

  if (visualization === 'bar') {
    // Rankings / comparisons: both table and bar chart
    return {
      table: entries,
      chart: buildChartData(entries, groupBy, valueKey, 'bar'),
      summary: null,
    };
  }

  if (visualization === 'line') {
    // Trends: chart only, no table
    return {
      table: null,
      chart: buildChartData(entries, groupBy, valueKey, 'line'),
      summary: null,
    };
  }

  if (visualization === 'pie') {
    // Distribution: chart only, no table
    return {
      table: null,
      chart: buildChartData(entries, groupBy, valueKey, 'pie'),
      summary: null,
    };
  }

  // Fallback: table only
  return { table: entries, chart: null, summary: null };
}

function applyFilter(rows, filter) {
  if (!filter) return rows;
  const term = String(filter).toLowerCase();
  return rows.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(term))
  );
}

function buildGroupedEntries(rows, groupBy, metric, column, sortDir, limit) {
  const groups = {};
  for (const row of rows) {
    const key = String(row[groupBy] ?? 'Unknown');
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const valueKey = getMetricLabel(metric, column);
  let entries = Object.entries(groups).map(([key, groupRows]) => ({
    [groupBy]: key,
    [valueKey]: computeMetric(groupRows, metric, column),
  }));

  const dir = sortDir === 'asc' ? 1 : -1;
  entries.sort((a, b) => dir * (a[valueKey] - b[valueKey]));

  if (limit) entries = entries.slice(0, limit);
  return entries;
}

function computeMetric(rows, metric, column) {
  const col = column || findNumericColumn(rows);
  switch (metric) {
    case 'count':
      return rows.length;
    case 'sum':
      return col ? round(rows.reduce((s, r) => s + (Number(r[col]) || 0), 0)) : rows.length;
    case 'avg': {
      if (!col || rows.length === 0) return 0;
      return round(rows.reduce((s, r) => s + (Number(r[col]) || 0), 0) / rows.length);
    }
    case 'max':
      return col ? Math.max(...rows.map((r) => Number(r[col]) || 0)) : rows.length;
    case 'min':
      return col ? Math.min(...rows.map((r) => Number(r[col]) || 0)) : rows.length;
    default:
      return rows.length;
  }
}

function findNumericColumn(rows) {
  if (!rows.length) return null;
  return Object.keys(rows[0]).find((k) => typeof rows[0][k] === 'number') || null;
}

function getMetricLabel(metric, column) {
  return column ? `${metric}_${column}` : (metric || 'count');
}

function buildChartData(entries, groupBy, valueKey, type) {
  return {
    type,
    data: entries.map((e) => ({
      name: String(e[groupBy]),
      value: Number(e[valueKey]) || 0,
    })),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

export function computeStats(rows, columns) {
  const stats = {};
  for (const col of columns) {
    const values = rows
      .map((r) => r[col])
      .filter((v) => v !== '' && v !== null && v !== undefined);
    const nums = values.map(Number).filter((n) => !isNaN(n));

    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      stats[col] = {
        type: 'numeric',
        count: nums.length,
        sum: round(sum),
        avg: round(sum / nums.length),
        min: Math.min(...nums),
        max: Math.max(...nums),
      };
    } else {
      const unique = [...new Set(values.map(String))];
      stats[col] = {
        type: 'categorical',
        count: values.length,
        unique: unique.length,
        topValues: unique.slice(0, 5),
      };
    }
  }
  return stats;
}
