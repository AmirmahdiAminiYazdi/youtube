# Optional MCP servers

Three of the 28 tools are MCP servers that control something outside the repo (an app or an account). They are **not** enabled by default. `mcp.example.json` holds ready configs. To use one, copy its block into a `.mcp.json` at the repo root (Claude Code asks for approval the first time) and follow the notes below.

| Server | Needs | Pinned to | Status here |
|---|---|---|---|
| `blender` ([ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp), PyPI `mcp-for-blender`) | Blender on your computer, the addon enabled | PyPI `2.2.6`, source commit `992233b` | Server package installs and imports. Not tested against a real Blender (none in the cloud container). |
| `after-effects` ([Dakkshin/after-effects-mcp](https://github.com/Dakkshin/after-effects-mcp)) | Adobe After Effects (paid), the bridge panel installed | commit `88d5fbf` | Builds and answers the MCP `initialize` handshake. Not tested against After Effects. |
| `21st` ([21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp)) | A free API key from 21st.dev/mcp in `API_KEY_21ST` | hosted service | Not testable without a key. The repo is now only a compatibility proxy; the maintainers recommend `npx @21st-dev/cli@latest init`. |

## Safety notes (read before enabling)

- **Blender** can run arbitrary Python inside your Blender process. That is the feature. Third-party text (asset names from Poly Haven, Sketchfab) reaches the model, so the config sets `BLENDER_MCP_SAFE_MODE=1` (upstream's opt-in script validator) and `DISABLE_TELEMETRY=1` (upstream telemetry goes to a Supabase backend). Read each script before you approve it. Remove the safe-mode line only if you know why.
- **After Effects**: the bridge panel runs scripts in After Effects from a temp-file queue. Install it by hand: `bash scripts/setup.sh` with `SETUP_MCP=1`, then `cd tools/mcp/vendor/after-effects-mcp && npm ci --ignore-scripts && npm run build`, then copy `build/scripts/mcp-bridge-auto.jsx` into After Effects' `Scripts/ScriptUI Panels` folder yourself (upstream's `install-bridge` script writes into the Adobe install folder, so it is not run automatically). In After Effects enable "Allow Scripts to Write Files and Access Network". Do not use the npm package named `after-effects-mcp`: its version number (1.13.0) does not match this repository (1.0.0), so it may be a different project.
- **21st**: your prompts are sent to 21st.dev. Keep the key in the environment, never in a committed file.

None of this matters for the daily Shorts pipeline, which runs on HyperFrames, Remotion and ffmpeg. These are for 3D and After Effects work when a video needs it.
