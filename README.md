# Golf Caddie

A cross-platform golf companion app built with React + TypeScript + Tauri. Track scores, view GPS hole maps, and play the hat game with friends.

## Screenshots

| Home | Play | Scorecard |
|------|------|-----------|
| ![Home screen showing recent rounds and start button](docs/screenshots/home.png) | ![Play screen showing per-player stroke counters](docs/screenshots/play.png) | ![Scorecard screen showing hole-by-hole scores and stats](docs/screenshots/scorecard.png) |

## Development Commands

| Goal | Command | Don't also run |
|------|---------|----------------|
| Test in the browser only | `npm run dev` | — |
| Run the full Tauri desktop app | `npm run tauri dev` | `npm run dev` separately |
| Build for production | `npm run build` then `npm run tauri build` | — |
