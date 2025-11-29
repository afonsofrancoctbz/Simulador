

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';

export async function runMCP() {
  // This function is now a no-op since the @modelcontextprotocol/sdk is removed.
  // We keep the file to avoid breaking imports, but it does nothing.
  return {
    server: null,
    fileSystemTool: null,
  };
}
