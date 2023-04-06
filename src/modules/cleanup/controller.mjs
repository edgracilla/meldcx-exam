import cron from 'node-cron';
import config from '../../config.mjs';

async function fileCleanupJob() {
  return cron.schedule(config.cronSched, () => {
    console.log('Cron job executed!');
  });
}

export default {
  fileCleanupJob,
};
