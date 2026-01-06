/**
 * Foundry Compute Module Adapter
 *
 * Provides a BufferStream class that mimics the dataStream interface
 * used by the research agent, but buffers all data instead of streaming.
 * This enables synchronous JSON responses for Foundry Server Integration.
 */

import { Activity } from './types';

export interface BufferedData {
  type: 'activity' | 'report';
  content: ActivityContent | string;
}

export interface ActivityContent {
  type: Activity['type'];
  status: Activity['status'];
  message: string;
  timestamp: number;
  completedSteps: number;
  tokenUsed: number;
}

/**
 * BufferStream - A mock stream that stores data in memory
 * instead of writing to an HTTP response.
 *
 * Implements the same interface as the dataStream wrapper
 * used in the streaming route.
 */
export class BufferStream {
  private buffer: BufferedData[] = [];

  /**
   * Write data to the buffer (same interface as dataStream.writeData)
   */
  writeData(data: BufferedData): void {
    this.buffer.push(data);
  }

  /**
   * Get all buffered data
   */
  getData(): BufferedData[] {
    return this.buffer;
  }

  /**
   * Get all activity entries
   */
  getActivities(): ActivityContent[] {
    return this.buffer
      .filter((item): item is BufferedData & { type: 'activity'; content: ActivityContent } =>
        item.type === 'activity' && typeof item.content === 'object'
      )
      .map(item => item.content);
  }

  /**
   * Get the final report (if any)
   */
  getReport(): string | null {
    const reportEntry = this.buffer.find(
      (item): item is BufferedData & { type: 'report'; content: string } =>
        item.type === 'report' && typeof item.content === 'string'
    );
    return reportEntry?.content ?? null;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Get buffer size
   */
  size(): number {
    return this.buffer.length;
  }
}

/**
 * Factory function to create a BufferStream instance
 * with the same interface expected by deepResearch
 */
export function createBufferStream(): BufferStream {
  return new BufferStream();
}
