#!/bin/bash
# Pre-tool hook - validates tool calls before execution
# Exit: 0 = allow, 2 = block

set -e

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

block() { echo "$1" >&2; exit 2; }

# Bash command restrictions
if [ "$TOOL_NAME" = "Bash" ]; then
    CMD=$(echo "$TOOL_INPUT" | jq -r '.command // empty')

    # Block git write operations
    echo "$CMD" | grep -qE 'git\s+(commit|push|add|merge|rebase|reset)' && \
        block "BLOCKED: Git write operations not allowed. User handles manually."

    # Block dangerous rm
    echo "$CMD" | grep -qE 'rm\s+(-rf|-fr)\s+(/|~|\.|src|lib|tests)' && \
        block "BLOCKED: Dangerous rm command."

    # Block npm publish without dry-run
    echo "$CMD" | grep -qE 'npm\s+publish' && ! echo "$CMD" | grep -qE '--dry-run' && \
        block "BLOCKED: Use 'npm publish --dry-run' first."
fi

# File protection
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')

    echo "$FILE" | grep -qE '\.env' && block "BLOCKED: Cannot edit .env files."
    echo "$FILE" | grep -qE 'package-lock\.json$' && block "BLOCKED: Use npm commands for package-lock.json."
    echo "$FILE" | grep -qE 'src/version\.ts$' && block "BLOCKED: Auto-generated. Run 'make build'."
    echo "$FILE" | grep -qE 'src/models/index\.ts$' && block "BLOCKED: Auto-generated. Run 'make build'."
fi

# New file size limit (500 lines max for NEW files only)
if [ "$TOOL_NAME" = "Write" ]; then
    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')

    # Only check if file doesn't exist (new file)
    if [ ! -f "$FILE" ]; then
        CONTENT=$(echo "$TOOL_INPUT" | jq -r '.content // empty')
        LINE_COUNT=$(echo "$CONTENT" | wc -l)

        if [ "$LINE_COUNT" -gt 500 ]; then
            block "BLOCKED: New files cannot exceed 500 lines ($LINE_COUNT lines). Split into smaller modules."
        fi
    fi
fi

exit 0
