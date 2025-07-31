import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { Message, NylasApiError, NylasResponse } from 'nylas';
import type { SendAttachmentsExamples } from './examples';
import { FileFormat, TestFileManager } from './utils/attachment-file-manager';

interface CliOptions {
  attachmentSize: 'small' | 'large';
  format: FileFormat;
  testEmail?: string;
}

async function getCliOptions(fileManager: TestFileManager): Promise<CliOptions> {
  console.log(chalk.blue.bold('\n🚀 Nylas Send Attachments Examples\n'));
  
  fileManager.checkFileStatus();
  
  const smallFiles = fileManager.getSmallFiles();
  const largeFiles = fileManager.getLargeFiles();
  
  if (smallFiles.length === 0 && largeFiles.length === 0) {
    console.log(chalk.red('\n❌ No test files found! Please create the required test files in attachments/'));
    process.exit(1);
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Which attachment method would you like to demonstrate?',
      choices: [
        { name: '📁 File paths (recommended)', value: 'file' },
        { name: '🌊 Streams (advanced)', value: 'stream' },
        { name: '💾 Buffers (small files)', value: 'buffer' },
        { name: '📝 String content (dynamic)', value: 'string' },
      ]
    },
    {
      type: 'list',
      name: 'attachmentSize',
      message: 'What size attachments?',
      choices: [
        { name: `📎 Small (${smallFiles.length} available)`, value: 'small', disabled: smallFiles.length === 0 },
        { name: `📋 Large (${largeFiles.length} available)`, value: 'large', disabled: largeFiles.length === 0 }
      ]
    },
    {
      type: 'input',
      name: 'testEmail',
      message: 'Recipient email address:',
      default: process.env.TEST_EMAIL || '',
      validate: (input: string) => input.includes('@') || 'Please enter a valid email address'
    }
  ]);

  return answers as CliOptions;
}

async function runExample(examples: SendAttachmentsExamples, fileManager: TestFileManager, options: CliOptions): Promise<void> {
  const { format, testEmail, attachmentSize } = options;
  
  if (!testEmail) {
    console.log(chalk.yellow('⚠️  No email provided. Skipping send.'));
    return;
  }
  
  try {
    console.log(chalk.blue(`\n📤 Running ${format} attachment example (${attachmentSize} files)...\n`));
    
    let result: NylasResponse<Message>;
    const isLarge = attachmentSize === 'large';
    
    // Route to the appropriate example based on format
    switch (format) {
      case 'file':
        result = await examples.sendFilePathAttachments(fileManager, testEmail, isLarge);
        break;
      case 'stream':
        result = await examples.sendStreamAttachments(fileManager, testEmail, isLarge);
        break;
      case 'buffer':
        result = await examples.sendBufferAttachments(fileManager, testEmail, isLarge);
        break;
      case 'string':
        result = await examples.sendStringAttachments(fileManager, testEmail, isLarge);
        break;
      default:
        result = await examples.sendAttachmentsByFormat(fileManager, format, testEmail, attachmentSize);
    }
    
    console.log(chalk.green.bold('\n✅ Message sent successfully!'));
    console.log(chalk.green(`📧 Message ID: ${result.data.id}`));
    console.log(chalk.green(`📎 Attachments: ${result.data.attachments?.length || 0}`));
    
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Error sending message:'));
    if (error instanceof NylasApiError) {
      console.log(chalk.red(`  ${error.message} (${error.statusCode})`));
    } else if (error instanceof Error) {
      console.log(chalk.red(`  ${error.message}`));
    }
  }
}

async function runBatchMode(examples: SendAttachmentsExamples, fileManager: TestFileManager, size: 'small' | 'large', format: FileFormat, email?: string): Promise<void> {
  const options: CliOptions = {
    attachmentSize: size,
    format,
    testEmail: email
  };
  
  console.log(chalk.blue.bold('\n🚀 Nylas Send Attachments (Batch Mode)\n'));
  fileManager.checkFileStatus();
  
  await runExample(examples, fileManager, options);
}

export async function startCli(examples: SendAttachmentsExamples, fileManager: TestFileManager, testEmail: string): Promise<void> {
  const program = new Command();
  
  program
    .name('send-attachments')
    .description('Nylas SDK attachment examples')
    .version('1.0.0');
  
  program
    .command('interactive', { isDefault: true })
    .description('Run interactive examples')
    .action(async () => {
      const options = await getCliOptions(fileManager);
      await runExample(examples, fileManager, options);
    });
  
  program
    .command('small')
    .description('Send small attachments')
    .option('-f, --format <format>', 'format (file|stream|buffer|string)', 'file')
    .option('-e, --email <email>', 'recipient email')
    .action(async (options) => {
      await runBatchMode(examples, fileManager, 'small', options.format as FileFormat, options.email || testEmail);
    });
  
  program
    .command('large')
    .description('Send large attachment')
    .option('-f, --format <format>', 'format (file|stream|buffer|string)', 'file')
    .option('-e, --email <email>', 'recipient email')
    .action(async (options) => {
      await runBatchMode(examples, fileManager, 'large', options.format as FileFormat, options.email || testEmail);
    });
  
  program
    .command('status')
    .description('Check test files')
    .action(() => {
      console.log(chalk.blue.bold('\n📁 Test Files Status\n'));
      fileManager.checkFileStatus();
    });
  
  await program.parseAsync();
} 