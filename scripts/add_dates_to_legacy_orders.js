const fs = require('fs');
const path = require('path');

const legacyDir = path.join(__dirname, '../data/legacy_data');

// Map month abbreviations to numbers
const monthMap = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

function parseFilenameToDate(filename) {
  // Remove .json extension
  const name = filename.replace('.json', '').toLowerCase();
  
  // Match pattern like "aug27" or "oct1"
  const match = name.match(/^([a-z]{3})(\d{1,2})$/);
  if (!match) {
    throw new Error(`Cannot parse filename: ${filename}`);
  }
  
  const [, monthStr, dayStr] = match;
  const month = monthMap[monthStr];
  const day = parseInt(dayStr, 10);
  
  if (month === undefined) {
    throw new Error(`Unknown month in filename: ${filename}`);
  }
  
  // All files are from 2025
  const year = 2025;
  
  // Create date at noon UTC to avoid timezone issues
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  
  return date.toISOString();
}

function processFile(filename) {
  const filePath = path.join(legacyDir, filename);
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  
  if (!content) {
    console.warn(`⚠ Skipping ${filename}: empty file`);
    return;
  }
  
  const orders = JSON.parse(content);
  
  if (!Array.isArray(orders)) {
    console.warn(`⚠ Skipping ${filename}: not an array`);
    return;
  }
  
  const baseDate = parseFilenameToDate(filename);
  
  // Add created_at to each order with incremental time offsets
  const updatedOrders = orders.map((order, index) => {
    // Skip if already has created_at
    if (order.created_at) {
      return order;
    }
    
    // Add a few minutes offset for each order to avoid identical timestamps
    const date = new Date(baseDate);
    date.setMinutes(date.getMinutes() + index * 5);
    
    return {
      ...order,
      created_at: date.toISOString()
    };
  });
  
  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(updatedOrders, null, 2), 'utf-8');
  console.log(`✓ Updated ${filename}: ${updatedOrders.length} orders`);
}

// Process all JSON files in legacy_data directory
try {
  const files = fs.readdirSync(legacyDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  console.log(`Found ${jsonFiles.length} JSON files to process\n`);
  
  jsonFiles.forEach(file => {
    try {
      processFile(file);
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }
  });
  
  console.log('\n✓ All files processed successfully');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
