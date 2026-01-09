#!/bin/bash
# Post-tool hook - Auto-format code after edits
set -e

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')

# Auto-format TypeScript/JavaScript files after editing
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
    FILE=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')

    # Format .ts/.js files in src/ or tests/
    if echo "$FILE" | grep -qE '\.(ts|js)$' && echo "$FILE" | grep -qE '(src|tests)/'; then
        if [ -f "$FILE" ]; then
            npx prettier --write "$FILE" 2>/dev/null || true
            npx eslint --fix "$FILE" 2>/dev/null || true
        fi
    fi
fi

exit 0
