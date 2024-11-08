/**
 * Get precise text measurements including actual bounding box
 * @private
 */
export function measureText(ctx: CanvasRenderingContext2D, text: string) {
  const metrics = ctx.measureText(text);
  return {
    width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    // Keep additional metrics for potential use
    baseline: metrics.actualBoundingBoxAscent,
    metrics: metrics,
  };
}

/**
 * Uses binary search to find the longest substring that fits within maxWidth
 * @private
 */
export function findBestFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  ellipsis = "..."
) {
  let start = 0;
  let end = text.length;
  let bestFit = "";

  const ellipsisMetrics = measureText(ctx, ellipsis);
  // If ellipsis alone is too wide, return empty string with ellipsis
  if (ellipsisMetrics.width >= maxWidth) {
    return ellipsis;
  }
  // Adjust maxWidth to account for ellipsis
  const availableWidth = maxWidth - ellipsisMetrics.width;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const testText = text.substring(0, mid);
    const { width } = measureText(ctx, testText);

    if (width <= availableWidth) {
      bestFit = testText;
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return bestFit + ellipsis;
}

/**
 * Draws text with ellipsis if it exceeds the maximum width
 * @param {string} text - The text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} maxWidth - Maximum width before truncating
 * @param {string} ellipsis - Ellipsis characters (default: '...')
 * @returns {object} - Contains whether text was truncated and the actual dimensions
 */
export function drawTextWithEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  ellipsis = "..."
) {
  const metrics = measureText(ctx, text);

  // Check if text needs truncation
  if (metrics.width <= maxWidth) {
    // Draw at baseline for proper alignment
    ctx.fillText(text, x, y + metrics.baseline);
    return {
      truncated: false,
      metrics,
    };
  }

  // Use binary search to find best fit
  const truncatedText = findBestFit(ctx, text, maxWidth, ellipsis);
  const truncatedMetrics = measureText(ctx, truncatedText);

  // Draw at baseline for proper alignment
  ctx.fillText(truncatedText, x, y + truncatedMetrics.baseline);

  return {
    truncated: true,
    metrics: truncatedMetrics,
  };
}

/**
 * Measures and returns truncated text with ellipsis
 * @param {string} text - The text to measure
 * @param {number} maxWidth - Maximum width before truncating
 * @param {string} ellipsis - Ellipsis characters (default: '...')
 * @returns {object} - Contains final text, dimensions, and truncation status
 */
export function getTruncatedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  ellipsis = "..."
) {
  const metrics = measureText(ctx, text);

  if (metrics.width <= maxWidth) {
    return {
      text,
      truncated: false,
      metrics,
    };
  }

  const truncatedText = findBestFit(ctx, text, maxWidth, ellipsis);
  const truncatedMetrics = measureText(ctx, truncatedText);

  return {
    text: truncatedText,
    truncated: true,
    metrics: truncatedMetrics,
  };
}
