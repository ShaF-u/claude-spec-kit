import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Spawns one stdio MCP server from .mcp.json, runs initialize +
// tools/list, and returns the tools array -- what Claude Code puts into
// the system prompt for the whole session while the server is connected.
// Resolves to null (not an error) when the command doesn't exist, so a
// project whose server isn't built yet still gets every other number.
export function listMcpTools(server, cwd, timeoutMs = 60000) {
  const command = path.isAbsolute(server.command) ? server.command : path.join(cwd, server.command);
  if (!existsSync(command)) return Promise.resolve(null);

  return new Promise((resolve) => {
    const proc = spawn(command, server.args ?? [], { cwd, stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, ...(server.env ?? {}) } });
    const timer = setTimeout(() => {
      proc.kill();
      resolve(null);
    }, timeoutMs);
    const finish = (value) => {
      clearTimeout(timer);
      proc.stdin.end();
      proc.kill();
      resolve(value);
    };
    createInterface({ input: proc.stdout }).on('line', (line) => {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }
      if (msg.id === 1) {
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n');
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
      } else if (msg.id === 2) {
        finish(msg.result?.tools ?? null);
      }
    });
    proc.on('exit', () => finish(null));
    proc.stdin.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'spec-kit-bench', version: '0.1.0' } },
      }) + '\n'
    );
  });
}
