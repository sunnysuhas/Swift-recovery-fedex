
import fs from 'fs';
import path from 'path';
import { db } from '../lib/db';
import { cases } from '../lib/db/schema';

// Mock RPA: Watch 'import/input' folder for .json files (simulating excel)
// and move to 'import/processed'

const INPUT_DIR = path.join(process.cwd(), 'import', 'input');
const PROCESSED_DIR = path.join(process.cwd(), 'import', 'processed');

async function runRpa() {
    console.log('Running RPA File Watcher...');

    // Ensure dirs exist
    if (!fs.existsSync(INPUT_DIR)) fs.mkdirSync(INPUT_DIR, { recursive: true });
    if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

    // Read files
    const files = fs.readdirSync(INPUT_DIR);
    console.log(`Found ${files.length} files to process.`);

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        console.log(`Processing ${file}...`);
        const filePath = path.join(INPUT_DIR, file);

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            const items = Array.isArray(data) ? data : [data];

            // Insert into DB
            let count = 0;
            for (const item of items) {
                // Simplified insert mapping
                await db.insert(cases).values({
                    id: item.id || `case-rpa-${Date.now()}-${count}`,
                    debtorName: item.debtorName || 'Unknown',
                    amount: item.amount || 0,
                    aging: item.aging || 0,
                    status: 'New',
                    createdAt: new Date()
                });
                count++;
            }
            console.log(`Imported ${count} cases from ${file}.`);

            // Move file
            fs.renameSync(filePath, path.join(PROCESSED_DIR, file));

        } catch (e) {
            console.error(`Failed to process ${file}`, e);
        }
    }
}

// If running as script, execute once.
// In real life, use chokidar to watch or setInterval.
runRpa().catch(console.error);
