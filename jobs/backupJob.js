import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";
dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;
const BACKUP_FOLDER = path.resolve(process.env.BACKUP_FOLDER);

const stat = promisify(fs.stat);

// Create a cron job to run every 10 seconds for backup
cron.schedule("*/10 * * * * *", () => {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const backupFile = path.join(BACKUP_FOLDER, `${DATABASE_NAME}-${timestamp}`);

  const command = `mongodump --uri="${process.env.MONGO_URI}" --out="${backupFile}"`;

  console.log(`Starting backup at ${new Date().toLocaleString()}`);

  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during backup: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Backup successful! Files saved to ${backupFile}`);
  });
});

// delete backups older than 1 minute
cron.schedule("* * * * *", async () => {  // Runs every minute
  const currentTime = new Date().getTime();
  const oneMinuteAgo = currentTime - 60000; // 60,000 ms = 1 minute

  console.log(`Checking for backups older than 1 minute at ${new Date().toLocaleString()}`);

  // Get the list of backup directories
  fs.readdir(BACKUP_FOLDER, (err, files) => {
    if (err) {
      console.error("Error reading backup directory", err);
      return;
    }

    files.forEach(async (file) => {
      const filePath = path.join(BACKUP_FOLDER, file);
      
      try {
        // Check if it's a directory and not a file
        const stats = await stat(filePath);

        // If it's a directory and older than 1 minute, delete it
        if (stats.isDirectory() && stats.mtime.getTime() < oneMinuteAgo) {
          console.log(`Deleting backup folder: ${filePath}`);
          fs.rm(filePath, { recursive: true, force: true }, (error) => {
            if (error) {
              console.error(`Error deleting folder ${filePath}:`, error);
            } else {
              console.log(`Deleted backup folder: ${filePath}`);
            }
          });
        }
      } catch (err) {
        console.error(`Error checking file stats for ${filePath}:`, err);
      }
    });
  });
});

export default {
  startBackupJob: () => {
    console.log("Backup job started.");
  },
};
