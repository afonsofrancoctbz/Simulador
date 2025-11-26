
import { Server, Tool, logger } from '@modelcontextprotocol/sdk';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';

export async function runMCP() {
  const fileSystemTool = Tool.create({
    name: 'file_system',
    description: 'Tool for interacting with the file system.',
  });

  fileSystemTool.define(
    'list_directory',
    {
      description:
        'List files and directories in a given path. The path should be relative to the project root.',
      input: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path to list.',
          },
        },
        required: ['path'],
      },
      output: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    async ({ path: dirPath }) => {
      try {
        const files = await glob(`${dirPath}/*`, {
          cwd: path.resolve(__dirname, '../..'),
        });
        return { files };
      } catch (e: any) {
        logger.error(e);
        return { error: e.message };
      }
    }
  );

  fileSystemTool.define(
    'read_file',
    {
      description:
        'Read the contents of a file. The path should be relative to the project root.',
      input: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path to the file to read.',
          },
        },
        required: ['path'],
      },
      output: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
          },
        },
      },
    },
    async ({ path: filePath }) => {
      try {
        const content = await readFile(
          path.resolve(__dirname, '../..', filePath),
          'utf-8'
        );
        return { content };
      } catch (e: any) {
        logger.error(e);
        return { error: e.message };
      }
    }
  );

  const server = new Server({
    tools: [fileSystemTool],
  });
  await server.start();
  return {
    server,
    fileSystemTool,
  };
}
