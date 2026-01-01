import cron from 'node-cron';
import { config } from '../../config/index.js';
import { fetchAllSources } from '../aggregator/index.js';

let scheduledTask: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  if (scheduledTask) {
    console.log('Scheduler already running');
    return;
  }

  console.log(`Starting scheduler with cron: ${config.fetchIntervalCron}`);

  scheduledTask = cron.schedule(config.fetchIntervalCron, async () => {
    console.log('Running scheduled fetch...');
    try {
      await fetchAllSources();
    } catch (error) {
      console.error('Scheduled fetch failed:', error);
    }
  });

  console.log('Scheduler started');
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('Scheduler stopped');
  }
}
