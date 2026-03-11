import { NextResponse } from 'next/server';
import items from '@/data/items.json';
import { INSTRUMENTATION_HOOK_FILENAME } from 'next/dist/lib/constants';

export const revalidate = 28800; 

export async function GET() {
  const livePrices: Record<string, number> = {};
  const realm = "nordanaar";

  const fetchPromises = Object.entries(items).map(async ([itemName, itemData]) => {
    const itemId = itemData;
    if (!itemId) return;

    try {
      // Fetching the data
      const res = await fetch(`https://api.wowauctions.net/items/stats/30d/nordanaar/mergedAh/${itemId}`, {
        // 28800 seconds = 8 hours
        next: { revalidate: 28800 }, 
        headers: {'User-Agent': 'Consume-Calc'}
      });

      if (!res.ok) throw new Error(`Failed to fetch ${itemName}`);

      const historyData = await res.json();

      // Parse the timestamp keys to get the most recent price
      const timeKeys = Object.keys(historyData).sort();
      const latestKey = timeKeys[timeKeys.length - 1];
      const latestStats = historyData[latestKey];

      // Store the latest min_buy price if available
      // Options are bid, min_buy, avg_price, and available
      if (latestStats && latestStats.min_buy) {
        livePrices[itemName] = latestStats.min_buy;
      }
    } catch (err) {
      console.error(`Error fetching ${itemName}:`, err);
    }
  });

  await Promise.all(fetchPromises);
  
  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    prices: livePrices
  });
}