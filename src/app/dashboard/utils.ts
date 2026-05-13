// Dashboard utility functions

/**
 * Process raw performances into grouped discipline data with improvement tracking
 */
export function processPerformances(performances: any[]): { [key: string]: any } {
  const grouped: { [key: string]: any[] } = {};

  performances.forEach(perf => {
    const dist = perf.distance || "Inconnu";
    if (!grouped[dist]) {
      grouped[dist] = [];
    }
    grouped[dist].push(perf);
  });

  const result: { [key: string]: any } = {};

  for (const [distance, records] of Object.entries(grouped)) {
    const sortedByDate = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedByTime = [...records].sort((a, b) => parseFloat(a.temps.toString()) - parseFloat(b.temps.toString()));

    const firstRecord = sortedByDate[0];
    const bestRecord = sortedByTime[0];

    const firstTime = parseFloat(firstRecord.temps.toString());
    const bestTime = parseFloat(bestRecord.temps.toString());

    let improvementTimeVal = bestTime - firstTime;
    let improvementPercentageVal = firstTime > 0 ? (improvementTimeVal / firstTime) * 100 : 0;

    let improvementTime = improvementTimeVal <= 0 ? `${improvementTimeVal.toFixed(2)}s` : `+${improvementTimeVal.toFixed(2)}s`;
    let improvementPercentage = improvementTimeVal <= 0 ? `${improvementPercentageVal.toFixed(1)}%` : `+${improvementPercentageVal.toFixed(1)}%`;

    result[distance] = {
      distance,
      records: sortedByDate,
      firstRecord,
      bestRecord,
      improvementTime,
      improvementPercentage
    };
  }

  return result;
}

/**
 * Utility to generate a high quality cropped image
 */
export async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Set canvas size to the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as blob with high quality
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 1.0); // 1.0 = Highest quality
  });
}

/**
 * Format a video URL into an embeddable format
 */
export const formatEmbedUrl = (url: string) => {
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const urlObj = new URL(url);
      let videoId = "";
      if (url.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      } else {
        videoId = urlObj.searchParams.get("v") || "";
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
};
