#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

interface SetupConfig {
  nylasApiKey: string;
  nylasApiUri: string;
  nylasGrantId: string;
  awsProfile?: string;
  awsRegion?: string;
  deployNow?: boolean;
}

// Check if a command exists
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Get version of a command
function getVersion(command: string): string {
  try {
    const output = execSync(`${command} --version`, { encoding: 'utf-8' });
    return output.trim().split('\n')[0];
  } catch {
    return 'unknown';
  }
}

// Check prerequisites
function checkPrerequisites(): boolean {
  console.log(chalk.blue.bold('\n🔍 Checking Prerequisites\n'));

  let allGood = true;

  // Check Node.js
  if (!commandExists('node')) {
    console.log(chalk.red('❌ Node.js is not installed'));
    console.log(chalk.yellow('   Install from: https://nodejs.org/'));
    allGood = false;
  } else {
    const nodeVersion = getVersion('node');
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 16) {
      console.log(chalk.red(`❌ Node.js ${nodeVersion} is too old (need 16+)`));
      allGood = false;
    } else {
      console.log(chalk.green(`✅ Node.js ${nodeVersion}`));
    }
  }

  // Check npm
  if (!commandExists('npm')) {
    console.log(chalk.red('❌ npm is not installed'));
    allGood = false;
  } else {
    console.log(chalk.green(`✅ npm ${getVersion('npm')}`));
  }

  // Check AWS CLI
  if (!commandExists('aws')) {
    console.log(chalk.yellow('⚠️  AWS CLI is not installed'));
    console.log(chalk.yellow('   Install from: https://aws.amazon.com/cli/'));
    console.log(
      chalk.yellow('   Or use AWS credentials in ~/.aws/credentials')
    );
  } else {
    console.log(chalk.green(`✅ AWS CLI ${getVersion('aws')}`));
  }

  // Check Serverless Framework
  if (!commandExists('serverless')) {
    console.log(chalk.yellow('⚠️  Serverless Framework not found globally'));
    console.log(chalk.yellow('   Will use npx serverless instead'));
  } else {
    console.log(
      chalk.green(`✅ Serverless Framework ${getVersion('serverless')}`)
    );
  }

  console.log('');
  return allGood;
}

// Check AWS credentials
async function checkAwsCredentials(): Promise<{
  profile?: string;
  region?: string;
}> {
  const awsDir = path.join(process.env.HOME || '', '.aws');
  const credentialsFile = path.join(awsDir, 'credentials');
  const configFile = path.join(awsDir, 'config');

  let hasCredentials = false;
  let profile = 'default';
  let region = 'us-east-1';

  if (fs.existsSync(credentialsFile)) {
    hasCredentials = true;
    console.log(chalk.green('✅ AWS credentials file found'));
  } else {
    console.log(chalk.yellow('⚠️  AWS credentials file not found'));
  }

  if (fs.existsSync(configFile)) {
    const configContent = fs.readFileSync(configFile, 'utf-8');
    const regionMatch = configContent.match(/region\s*=\s*(\S+)/);
    if (regionMatch) {
      region = regionMatch[1];
    }
  }

  // Check if AWS credentials are configured via environment variables
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    hasCredentials = true;
    console.log(
      chalk.green('✅ AWS credentials found in environment variables')
    );
  }

  if (!hasCredentials) {
    const { setupAws } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupAws',
        message: 'Would you like to set up AWS credentials now?',
        default: false,
      },
    ]);

    if (setupAws) {
      console.log(chalk.blue('\n📝 AWS Credentials Setup'));
      console.log(chalk.yellow('You can set up AWS credentials by:'));
      console.log(chalk.yellow('1. Running: aws configure'));
      console.log(
        chalk.yellow(
          '2. Or setting AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables'
        )
      );
      console.log(
        chalk.yellow('3. Or creating ~/.aws/credentials file manually\n')
      );

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'profile',
          message: 'AWS Profile name (default: default):',
          default: 'default',
        },
        {
          type: 'input',
          name: 'region',
          message: 'AWS Region (default: us-east-1):',
          default: 'us-east-1',
        },
      ]);

      profile = answers.profile;
      region = answers.region;
    }
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'profile',
        message: 'AWS Profile name (default: default):',
        default: 'default',
      },
      {
        type: 'input',
        name: 'region',
        message: 'AWS Region (default: us-east-1):',
        default: region,
      },
    ]);

    profile = answers.profile;
    region = answers.region;
  }

  return { profile, region };
}

// Interactive setup
async function interactiveSetup(): Promise<SetupConfig> {
  console.log(chalk.blue.bold('\n🚀 Nylas AWS Lambda Setup\n'));
  console.log(
    chalk.gray(
      'This will guide you through setting up the AWS Lambda example.\n'
    )
  );

  // Check prerequisites
  const prerequisitesOk = checkPrerequisites();
  if (!prerequisitesOk) {
    console.log(
      chalk.red('\n❌ Please install missing prerequisites before continuing.')
    );
    process.exit(1);
  }

  // Nylas credentials
  console.log(chalk.blue.bold('\n📋 Nylas Configuration\n'));
  console.log(chalk.gray('Get these from: https://dashboard.nylas.com\n'));

  const nylasAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'nylasApiKey',
      message: 'Nylas API Key:',
      validate: (input: string) => input.length > 0 || 'API Key is required',
    },
    {
      type: 'list',
      name: 'nylasApiUri',
      message: 'Nylas API Region:',
      choices: [
        {
          name: 'US (https://api.us.nylas.com)',
          value: 'https://api.us.nylas.com',
        },
        {
          name: 'EU (https://api.eu.nylas.com)',
          value: 'https://api.eu.nylas.com',
        },
        { name: 'Custom', value: 'custom' },
      ],
    },
    {
      type: 'input',
      name: 'customApiUri',
      message: 'Custom Nylas API URI:',
      when: (answers) => answers.nylasApiUri === 'custom',
      validate: (input: string) =>
        input.startsWith('http') || 'Must be a valid URL',
    },
    {
      type: 'input',
      name: 'nylasGrantId',
      message: 'Nylas Grant ID (connected account ID):',
      validate: (input: string) => input.length > 0 || 'Grant ID is required',
    },
  ]);

  // AWS configuration
  console.log(chalk.blue.bold('\n☁️  AWS Configuration\n'));
  const awsConfig = await checkAwsCredentials();

  // Deployment
  const deployAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'deployNow',
      message: 'Deploy to AWS Lambda now?',
      default: false,
    },
  ]);

  return {
    nylasApiKey: nylasAnswers.nylasApiKey,
    nylasApiUri: nylasAnswers.customApiUri || nylasAnswers.nylasApiUri,
    nylasGrantId: nylasAnswers.nylasGrantId,
    awsProfile: awsConfig.profile,
    awsRegion: awsConfig.region,
    deployNow: deployAnswer.deployNow,
  };
}

// Create .env file
function createEnvFile(config: SetupConfig): void {
  const envPath = path.join(__dirname, '.env');
  const envContent = `# Nylas Configuration
NYLAS_API_KEY=${config.nylasApiKey}
NYLAS_API_URI=${config.nylasApiUri}
NYLAS_GRANT_ID=${config.nylasGrantId}

# AWS Configuration (optional - can also use AWS credentials file)
AWS_PROFILE=${config.awsProfile || 'default'}
AWS_REGION=${config.awsRegion || 'us-east-1'}
`;

  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green(`✅ Created .env file at ${envPath}`));
}

// Update serverless.yml with region
function updateServerlessConfig(region: string): void {
  const serverlessPath = path.join(__dirname, 'serverless.yml');
  if (fs.existsSync(serverlessPath)) {
    let content = fs.readFileSync(serverlessPath, 'utf-8');

    // Update provider region if it exists
    if (content.includes('region:')) {
      content = content.replace(/region:\s*\S+/g, `region: ${region}`);
    } else {
      // Add region after provider name
      content = content.replace(/(provider:\s*\n)/, `$1  region: ${region}\n`);
    }

    fs.writeFileSync(serverlessPath, content);
    console.log(
      chalk.green(`✅ Updated serverless.yml with region: ${region}`)
    );
  }
}

// Deploy function
async function deploy(): Promise<void> {
  console.log(chalk.blue.bold('\n🚀 Deploying to AWS Lambda\n'));

  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log(chalk.red('❌ .env file not found!'));
      console.log(chalk.yellow('Please run: npm run setup'));
      process.exit(1);
    }

    // Load .env file to verify it has required variables
    dotenv.config({ path: envPath });
    if (!process.env.NYLAS_API_KEY || !process.env.NYLAS_GRANT_ID) {
      console.log(
        chalk.red('❌ Missing required environment variables in .env file!')
      );
      console.log(
        chalk.yellow('Please ensure NYLAS_API_KEY and NYLAS_GRANT_ID are set')
      );
      process.exit(1);
    }

    // Install dependencies first
    console.log(chalk.blue('📦 Installing dependencies...'));
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });

    // Deploy with serverless using dotenv-cli to ensure .env is loaded
    console.log(chalk.blue('\n☁️  Deploying to AWS...'));
    execSync('npx dotenv-cli -e .env -- npx serverless deploy', {
      stdio: 'inherit',
      cwd: __dirname,
    });

    console.log(chalk.green.bold('\n✅ Deployment successful!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(
      chalk.gray('1. Check the deployment output for your API Gateway URL')
    );
    console.log(
      chalk.gray(
        '2. Visit the URL in your browser to test the attachment sender'
      )
    );
    console.log(
      chalk.gray(
        '3. Try uploading multiple files totaling over 3MB to test the bug fix'
      )
    );
  } catch (error) {
    console.log(chalk.red('\n❌ Deployment failed'));
    console.log(
      chalk.yellow('Make sure AWS credentials are configured correctly')
    );
    console.log(chalk.yellow('Run: aws configure'));
    process.exit(1);
  }
}

// Main CLI
async function main() {
  const program = new Command();

  program
    .name('setup')
    .description('Setup CLI for Nylas AWS Lambda example')
    .version('1.0.0');

  program
    .command('interactive', { isDefault: true })
    .description('Run interactive setup')
    .action(async () => {
      const config = await interactiveSetup();
      createEnvFile(config);
      if (config.awsRegion) {
        updateServerlessConfig(config.awsRegion);
      }

      console.log(chalk.green.bold('\n✅ Setup complete!\n'));

      if (config.deployNow) {
        await deploy();
      } else {
        console.log(chalk.blue('Next steps:'));
        console.log(chalk.gray('1. Review the .env file'));
        console.log(chalk.gray('2. Run: npm install'));
        console.log(chalk.gray('3. Run: npm run deploy'));
        console.log(chalk.gray('4. Or run: npm run setup (to deploy now)'));
      }
    });

  program
    .command('deploy')
    .description('Deploy to AWS Lambda')
    .action(async () => {
      await deploy();
    });

  program
    .command('check')
    .description('Check prerequisites only')
    .action(() => {
      checkPrerequisites();
    });

  await program.parseAsync();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

export { main as setup };
