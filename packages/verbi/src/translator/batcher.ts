export function batchRequests<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new Error('Batch size must be positive');
  }

  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches;
}

export interface BatchProgress {
  total: number;
  completed: number;
  current: number;
  percentage: number;
}

export class BatchProcessor<T, R> {
  constructor(
    private readonly processor: (batch: T[]) => Promise<R[]>,
    private readonly options: {
      batchSize: number;
      onProgress?: (progress: BatchProgress) => void;
      concurrency?: number;
    }
  ) {}

  async process(items: T[]): Promise<R[]> {
    const batches = batchRequests(items, this.options.batchSize);
    const results: R[] = [];
    const totalItems = items.length;
    let completedItems = 0;

    // Process batches with concurrency control
    const concurrency = this.options.concurrency || 1;

    for (let i = 0; i < batches.length; i += concurrency) {
      const batchGroup = batches.slice(i, i + concurrency);

      const batchResults = await Promise.all(
        batchGroup.map((batch, index) =>
          this.processBatch(batch, i + index + 1, batches.length)
        )
      );

      for (const batchResult of batchResults) {
        results.push(...batchResult);
        completedItems += batchResult.length;

        if (this.options.onProgress) {
          this.options.onProgress({
            total: totalItems,
            completed: completedItems,
            current: completedItems,
            percentage: (completedItems / totalItems) * 100,
          });
        }
      }
    }

    return results;
  }

  private async processBatch(
    batch: T[],
    batchNumber: number,
    totalBatches: number
  ): Promise<R[]> {
    try {
      return await this.processor(batch);
    } catch (error) {
      throw new Error(
        `Batch ${batchNumber}/${totalBatches} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}