# Weigh Station (scale-serial-reader)

An Electron desktop app that reads weights from a USB/serial shipping scale and injects them live into the OMS Weigh Station page.

The app opens `https://oms.fulfillment.app/` in a window, finds the scale on a serial port, and, whenever the user is on a `tools/weighStation` page, writes the current reading into that page's form fields.

## How it works

1. **Startup:** checks GitHub Releases for an update, then opens the OMS in a 1366×768 window.
2. **Scale detection:** once the page loads, it lists serial ports and picks the first one whose manufacturer is in `manufacturerList` (currently `Prolific` and `FTDI`). It connects at **9600 baud** and reads line by line.
3. **Parsing:** each line is matched against:

   ```
   /(ST|US),(?:GS|GW),\s*([0-9.]+)\s*(lb|kg|kb)/
   ```

   For example, `ST,GW,    0.00 lb` gives weight `0.00` and units `lb`.
4. **Stability:** the app works out stability itself and doesn't trust the scale's `ST`/`US` flag. A non-zero weight that stays unchanged for `stableTimer` ms (default 1000) is marked `ST` (stable). Any change resets it to `US` (unstable).
5. **Injection:** on a `tools/weighStation` URL, the app sets these elements on the page:

   | Element id | Set to |
   |---|---|
   | `weight` (input) | current weight, e.g. `12.40` |
   | `status` | `ST` or `US` |
   | `units`  | `lb` / `kg` |

### Safety behavior

- The window closes with a notification if the PC **loses internet** (checked every second) or the **scale disconnects**.
- If no scale is found at launch, the app logs an error and stays open. It does not retry.

## Requirements

- Node.js and npm
- Windows (the primary target; builds an NSIS installer). macOS has helper scripts but isn't actively maintained.
- A scale with a Prolific or FTDI USB-serial adapter that outputs the format above. For other adapters, add the manufacturer to `manufacturerList` in `main.js`.

## Development

```bash
git clone https://github.com/Twistedst/scale-serial-reader.git
cd scale-serial-reader
npm install        # also rebuilds serialport for Electron (postinstall)
npm start          # runs against production OMS
```

To point at a local OMS on `http://localhost:3000` with DevTools open:

```bash
npm run test-win   # Windows (NODE_ENV=WINDEV)
npm run test-mac   # macOS   (NODE_ENV=DEV)
```

`WeighStation.bat` is a shortcut that runs `npm run start`.

### Environment variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `DEV` / `WINDEV` load `localhost:3000` with DevTools; anything else loads production |
| `stableTimer` | ms a reading must hold steady before it's marked stable (default `1000`) |
| `GH_TOKEN` | GitHub token with `repo` scope, needed only for `npm run publish` |

### Logs

Logs are written by [electron-log](https://github.com/megahertz/electron-log). On Windows they go to:
`%USERPROFILE%\AppData\Roaming\ScaleSerialReader\logs\main.log`

## Building & releasing

```bash
npm run pack       # unpacked build in dist/win-unpacked (quick test)
npm run dist       # installer: dist/Weigh Station Setup <version>.exe
```

To release an auto-update:

1. Bump `version` in `package.json`.
2. Set `GH_TOKEN` (PowerShell: `[Environment]::SetEnvironmentVariable("GH_TOKEN","<token>","User")`, then restart the terminal).
3. Run `npm run publish`. This builds and uploads a **draft** release to GitHub.
4. Publish the draft on the GitHub Releases page.

Installed copies check for updates on launch and prompt the user to download and install.

## Project structure

```
main.js          Main process: window, serial port, parsing, auto-update
renderer.js      Unused (legacy test renderer; the real UI is the OMS page)
WeighStation.bat Launch helper
assets/icons/    App icons
dist/            Build output (git-ignored)
```

## Credits

Originally based on [electron-serialport](https://github.com/johnny-five-io/electron-serialport) and the [electron-updater example](https://github.com/iffy/electron-updater-example).

## License

MIT. See [LICENSE](LICENSE).
