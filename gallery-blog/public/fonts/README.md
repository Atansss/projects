# Add your Mattone font files here

Mattone isn't distributed via Google Fonts, so it needs to be self-hosted.

1. Download it (free, SIL OFL license) from https://www.collletttivo.it/typefaces/mattone
   or https://www.fontsquirrel.com/fonts/mattone
2. Convert to `.woff2` if it isn't already (fontsquirrel.com/tools/webfont-generator works well)
3. Drop the file(s) in this folder as:
   - Mattone-Regular.woff2
   - Mattone-Bold.woff2 (if you have a bold weight; otherwise the CSS falls back gracefully)

Until these files are added, headings will render in the fallback (Poppins/system sans)
defined in src/index.css — nothing will break, it just won't be the exact typeface yet.
