// Quick test to verify file size generation
function testLargeContentGeneration() {
  // Create text content dynamically
  let textContent =
    'This is a dynamically created text file!\n\nGenerated at: ' +
    new Date().toISOString();
  let jsonContent = JSON.stringify(
    {
      message: 'Hello from Nylas SDK!',
      timestamp: new Date().toISOString(),
      data: { temperature: 72, humidity: 45 },
    },
    null,
    2
  );

  // Generate large content
  textContent += '\n\n' + '='.repeat(100) + '\n';
  textContent += 'LARGE FILE SIMULATION - TARGET SIZE: >3MB\n';
  textContent += '='.repeat(100) + '\n\n';

  // Generate enough content to exceed 3,145,728 bytes (3MB)
  const loremIpsum =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ';

  // Repeat Lorem ipsum to generate ~1.5MB of text content
  const targetTextSize = 1572864; // 1.5MB
  const repeats = Math.ceil(targetTextSize / loremIpsum.length);
  textContent += loremIpsum.repeat(repeats);

  // Add some structured data
  textContent += '\n\n' + '='.repeat(100) + '\n';
  textContent += 'LARGE DATASET SECTION\n';
  textContent += '='.repeat(100) + '\n\n';

  for (let i = 0; i < 1000; i++) {
    textContent += `Record ${i}: This is a detailed record with ID ${i} containing extensive information about item ${i}. `;
    textContent += `Timestamp: ${new Date().toISOString()}, Category: category-${i % 20}, `;
    textContent += `Tags: tag-${i}, tag-${i + 1}, tag-${i + 2}, tag-${i + 3}, `;
    textContent += `Properties: color=${['red', 'blue', 'green', 'yellow', 'purple', 'orange'][i % 6]}, `;
    textContent += `size=${['small', 'medium', 'large', 'extra-large'][i % 4]}, `;
    textContent += `active=${i % 2 === 0}, priority=${i % 10}, score=${Math.random().toFixed(6)}.\n`;
  }

  // Create a very large JSON structure to exceed 3MB total
  const largeData = Array.from({ length: 2000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is item number ${i} with extensive additional data to make the JSON file larger. Here's some detailed information about this item including its history, specifications, and metadata.`,
    timestamp: new Date().toISOString(),
    details: {
      category: `category-${i % 25}`,
      subcategory: `subcategory-${i % 50}`,
      tags: [
        `tag-${i}`,
        `tag-${i + 1}`,
        `tag-${i + 2}`,
        `tag-${i + 3}`,
        `tag-${i + 4}`,
      ],
      properties: {
        color: [
          'red',
          'blue',
          'green',
          'yellow',
          'purple',
          'orange',
          'pink',
          'cyan',
        ][i % 8],
        size: ['tiny', 'small', 'medium', 'large', 'extra-large', 'huge'][
          i % 6
        ],
        weight: `${(Math.random() * 1000).toFixed(2)}kg`,
        dimensions: {
          length: `${(Math.random() * 100).toFixed(2)}cm`,
          width: `${(Math.random() * 100).toFixed(2)}cm`,
          height: `${(Math.random() * 100).toFixed(2)}cm`,
        },
        active: i % 2 === 0,
        priority: i % 10,
        score: Math.random(),
        ratings: Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 5) + 1
        ),
      },
      history: Array.from({ length: 10 }, (_, j) => ({
        date: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        action: [
          'created',
          'updated',
          'viewed',
          'edited',
          'deleted',
          'restored',
        ][j % 6],
        user: `user-${j % 100}`,
        details: `Action ${j} performed on item ${i} with additional context and information.`,
      })),
    },
  }));

  jsonContent = JSON.stringify(
    {
      message: 'Hello from Nylas SDK - Large Dataset (>3MB)!',
      timestamp: new Date().toISOString(),
      totalItems: largeData.length,
      estimatedSize: '~2MB JSON content',
      items: largeData,
      metadata: {
        generated: new Date().toISOString(),
        purpose: 'Large file testing',
        targetSize: '3145728+ bytes',
        format: 'JSON',
      },
    },
    null,
    2
  );

  // Calculate sizes
  const textSize = Buffer.byteLength(textContent, 'utf8');
  const jsonSize = Buffer.byteLength(jsonContent, 'utf8');
  const totalSize = textSize + jsonSize;
  const targetSize = 3145728; // 3MB

  // eslint-disable-next-line no-console
  console.log(
    `Text content size: ${textSize.toLocaleString()} bytes (${(textSize / 1024 / 1024).toFixed(2)} MB)`
  );
  // eslint-disable-next-line no-console
  console.log(
    `JSON content size: ${jsonSize.toLocaleString()} bytes (${(jsonSize / 1024 / 1024).toFixed(2)} MB)`
  );
  // eslint-disable-next-line no-console
  console.log(
    `Total size: ${totalSize.toLocaleString()} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`
  );
  // eslint-disable-next-line no-console
  console.log(
    `Target size: ${targetSize.toLocaleString()} bytes (${(targetSize / 1024 / 1024).toFixed(2)} MB)`
  );
  // eslint-disable-next-line no-console
  console.log(`Exceeds target: ${totalSize > targetSize ? 'YES ✅' : 'NO ❌'}`);
  // eslint-disable-next-line no-console
  console.log(
    `Excess: ${totalSize > targetSize ? '+' : ''}${(totalSize - targetSize).toLocaleString()} bytes`
  );
}

testLargeContentGeneration();
