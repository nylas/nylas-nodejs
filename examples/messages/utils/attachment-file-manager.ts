import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { CreateAttachmentRequest } from 'nylas';

/**
 * File format types for different ways to handle attachments
 */
export type FileFormat = 'file' | 'stream' | 'buffer' | 'string';

/**
 * Maximum size for small files
 */
export const MAX_SMALL_FILE_SIZE_LIMIT = 1024 * 1024 * 3; // 3MB

/**
 * Interface for file information and content access
 */
interface FileHandler {
  path: string;
  exists: boolean;
  filename: string;
  size: number;
  contentType: string;

  // Methods to get content in different formats
  asFileRequest(): CreateAttachmentRequest;
  asStream(): fs.ReadStream;
  asBuffer(): Buffer;
  asString(): string;
}

/**
 * Common utility class for handling test files in different formats
 */
export class TestFileHandler implements FileHandler {
  public readonly path: string;
  public readonly exists: boolean;
  public readonly filename: string;
  public readonly size: number;
  public readonly contentType: string;

  constructor(fileName: string, baseDir?: string) {
    // Default to attachments subdirectory relative to the messages folder
    const attachmentsDir = baseDir || path.resolve(__dirname, '../attachments');
    this.path = path.resolve(attachmentsDir, fileName);
    this.exists = fs.existsSync(this.path);
    this.filename = path.basename(this.path);

    if (this.exists) {
      const stats = fs.statSync(this.path);
      this.size = stats.size;
      this.contentType = mime.lookup(this.path) || 'application/octet-stream';
    } else {
      this.size = 0;
      this.contentType = 'application/octet-stream';
    }
  }

  /**
   * Get file as CreateAttachmentRequest using file stream (original method)
   */
  asFileRequest(): CreateAttachmentRequest {
    if (!this.exists) {
      throw new Error(`File not found: ${this.filename}`);
    }

    return {
      filename: this.filename,
      contentType: this.contentType,
      content: fs.createReadStream(this.path),
      size: this.size,
    };
  }

  /**
   * Get file as a readable stream
   */
  asStream(): fs.ReadStream {
    if (!this.exists) {
      throw new Error(`File not found: ${this.filename}`);
    }
    return fs.createReadStream(this.path);
  }

  /**
   * Get file as a Buffer
   */
  asBuffer(): Buffer {
    if (!this.exists) {
      throw new Error(`File not found: ${this.filename}`);
    }
    return fs.readFileSync(this.path);
  }

  /**
   * Get file as a string (only works for text files)
   */
  asString(): string {
    if (!this.exists) {
      throw new Error(`File not found: ${this.filename}`);
    }

    // Check if it's likely a text file
    const textTypes = ['text/', 'application/json', 'application/xml'];
    const isTextFile = textTypes.some((type) =>
      this.contentType.startsWith(type)
    );

    if (!isTextFile && this.size > MAX_SMALL_FILE_SIZE_LIMIT) {
      // > 1MB
      throw new Error(
        `File ${this.filename} is too large or not a text file to read as string`
      );
    }

    return fs.readFileSync(this.path, 'utf8');
  }
}

/**
 * File manager utility to handle all test files
 */
export class TestFileManager {
  private files: Map<string, TestFileHandler> = new Map();
  private baseDir: string;

  constructor(baseDir?: string, files?: string[]) {
    // Default to attachments subdirectory relative to the messages folder
    this.baseDir = baseDir || path.resolve(__dirname, '../attachments');

    // Initialize all test files
    files?.forEach((fileName) => {
      this.files.set(fileName, new TestFileHandler(fileName, this.baseDir));
    });
  }

  /**
   * Get a file handler by filename
   */
  getFile(fileName: string): TestFileHandler {
    const handler = this.files.get(fileName);
    if (!handler) {
      throw new Error(`Unknown test file: ${fileName}`);
    }
    return handler;
  }

  /**
   * Get all available files
   */
  getAllFiles(): TestFileHandler[] {
    return Array.from(this.files.values());
  }

  /**
   * Get only files that exist
   */
  getExistingFiles(): TestFileHandler[] {
    return this.getAllFiles().filter((file) => file.exists);
  }

  /**
   * Get small files (< 1MB)
   */
  getSmallFiles(): TestFileHandler[] {
    return this.getExistingFiles().filter(
      (file) => file.size < MAX_SMALL_FILE_SIZE_LIMIT
    );
  }

  /**
   * Get large files (>= 1MB)
   */
  getLargeFiles(): TestFileHandler[] {
    return this.getExistingFiles().filter(
      (file) => file.size >= MAX_SMALL_FILE_SIZE_LIMIT
    );
  }

  /**
   * Check status of all test files
   */
  checkFileStatus(): void {
    console.log('\nChecking test file status:');
    this.getAllFiles().forEach((file) => {
      const status = file.exists
        ? `✓ Found (${file.size} bytes)`
        : '✗ Not found';
      const sizeLabel =
        file.size >= MAX_SMALL_FILE_SIZE_LIMIT ? 'LARGE' : 'SMALL';
      console.log(`  ${file.filename}: ${status} [${sizeLabel}]`);
    });
  }

  /**
   * Create attachment request for a file in the specified format
   */
  createAttachmentRequest(
    fileName: string,
    format: FileFormat
  ): CreateAttachmentRequest {
    const file = this.getFile(fileName);

    switch (format) {
      case 'file':
        return file.asFileRequest();

      case 'stream':
        return {
          filename: file.filename,
          contentType: file.contentType,
          content: file.asStream(),
          size: file.size,
        };

      case 'buffer':
        return {
          filename: file.filename,
          contentType: file.contentType,
          content: file.asBuffer(),
          size: file.size,
        };

      case 'string':
        const stringContent = file.asString();
        return {
          filename: file.filename,
          contentType: file.contentType,
          content: stringContent,
          size: Buffer.byteLength(stringContent, 'utf8'),
        };

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

/**
 * Helper function to create a file request builder for any file path
 * This maintains backward compatibility with the original function
 */
export function createFileRequestBuilder(
  filePath: string
): CreateAttachmentRequest {
  // If it's not an absolute path, assume it's in the attachments subdirectory
  const fullPath = path.resolve(__dirname, filePath);

  const stats = fs.statSync(fullPath);
  const filename = path.basename(fullPath);
  const contentType = mime.lookup(fullPath) || 'application/octet-stream';
  const content = fs.createReadStream(fullPath);

  return {
    filename,
    contentType,
    content,
    size: stats.size,
  };
}
