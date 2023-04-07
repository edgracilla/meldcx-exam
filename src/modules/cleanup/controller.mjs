import cron from 'node-cron';
import config from '../../config.mjs';
import fileCtl from '../files/controller.mjs';
import { logger } from '../../cores/index.mjs';

async function cleanup() {
  const days = config.fileTTL;

  // Get all file records
  const fileRecs = fileCtl.list();

  // Date preps
  const currentDate = new Date();
  const overdueDate = new Date();

  // Subtract x ttl days from current date
  overdueDate.setDate(currentDate.getDate() - days);

  // Filter out dates that are x days overdue
  const overdues = fileRecs.filter((rec) => {
    const dateObj = new Date(rec.createdAt);
    return dateObj <= overdueDate;
  });

  // Early exit if no overdues
  if (!overdues.length) return [];

  // Pool async destroy file request
  const delReqs = overdues.map((rec) => fileCtl.destroy(rec));

  try {
    // call del async reqs at once
    const result = await Promise.all(delReqs);
    logger.info(`Deleted ${result.length} inactive files..`);

    return result;
  } catch (err) {
    // supress err, we are in cron so we just log it and hand it to auditor
    logger.warn(err);
    return [];
  }
}

function fileCleanupJob() {
  return cron.schedule(config.cronSched, async () => {
    await cleanup();
  });
}

export default {
  fileCleanupJob,
};
