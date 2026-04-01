# TOTHOM AblePlayer for Drupal

Accessible HTML5 media player package based on Able Player, customized by TOTHOM.

This package provides:
- Able Player core build files
- TOTHOM custom JS/CSS layer
- Translation files (including `oc-aranes`)

## Version
- TOTHOM Edition: `v1.1.2`
- Able Player base used for customization: `v4.7.0`

## Installation

```bash
npm install tothom-ableplayer-drupal
```

This package is designed to be installed with npm and then copied or mirrored from `node_modules/tothom-ableplayer-drupal` into a Drupal site's `web/libraries/tothom-ableplayer-drupal` directory.

The custom translation lookup implemented in `custom-ableplayer/custom-player.js` assumes a Drupal deployment with these public URLs:
- `/sites/default/files/able-player/translations/<lang>.json`
- `/libraries/tothom-ableplayer-drupal/translations/<lang>.json`

Because of that, using the package directly from `node_modules` is not a supported final deployment layout for Drupal. If the package is not available under `/web/libraries/tothom-ableplayer-drupal`, the built-in translation paths will not resolve correctly.

## Required dependencies

Include these dependencies in your page/app:
- jQuery `3.7.1` (**Important!** Only if it is not already provided by Drupal core)
- js-cookie `3.0.1`

```bash
npm install jquery@3.7.1
npm install js-cookie@3.0.1
```

## File structure

```text
ableplayer/
  build/
    ableplayer.js
    ableplayer.min.js
    ableplayer.css
    ableplayer.min.css
  translations/
    ca.json
    es.json
    ...
custom-ableplayer/
  custom-player.js
  custom-player.css
```

## Basic standalone integration
This is an example for a standalone integration using CDN files for dependencies.

Important: this only shows how to load the JS and CSS files in isolation. The custom translation routing in this package is Drupal-oriented and expects the final deployed URLs described above. If you serve the package directly from `node_modules`, the translation lookup paths will not match this README's supported setup.

```html
<head>
  <!-- Dependencies -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>

  <!-- Able Player core -->
  <script src="./node_modules/tothom-ableplayer-drupal/ableplayer/build/ableplayer.js"></script>
  <link rel="stylesheet" href="./node_modules/tothom-ableplayer-drupal/ableplayer/build/ableplayer.css" />

  <!-- TOTHOM custom layer -->
  <script src="./node_modules/tothom-ableplayer-drupal/custom-ableplayer/custom-player.js"></script>
  <link rel="stylesheet" href="./node_modules/tothom-ableplayer-drupal/custom-ableplayer/custom-player.css" />
</head>
```

## Drupal integration

For Drupal projects, copy the package contents from `node_modules/tothom-ableplayer-drupal` into `/web/libraries/tothom-ableplayer-drupal` and do the same for dependencies (`jquery` and `js-cookie`), so all required assets are available under `/web/libraries`.

This is the supported deployment model for this package. The custom translation loader relies on the library being publicly reachable from `/libraries/tothom-ableplayer-drupal/`.

Then create a library in `YOUR_THEME.libraries.yml` that references those files from `/web/libraries`.

Example (assuming jQuery is provided by your Drupal core):

```yml
tothom_ableplayer:
  version: 1.x
  css:
    theme:
      /libraries/tothom-ableplayer-drupal/ableplayer/build/ableplayer.css: {}
      /libraries/tothom-ableplayer-drupal/custom-ableplayer/custom-player.css: {}
  js:
    /libraries/js-cookie/dist/js.cookie.js: {}
    /libraries/tothom-ableplayer-drupal/ableplayer/build/ableplayer.js: {}
    /libraries/tothom-ableplayer-drupal/custom-ableplayer/custom-player.js: {}
  dependencies:
    - core/jquery
```

Attach the library in Twig (for example, in a template where the player is rendered):

```twig
{{ attach_library('YOUR_THEME/tothom_ableplayer') }}
```

### Translation paths

The custom layer overrides Able Player's default translation lookup.

When the player needs `es.json`, `ca.json`, `oc-aranes.json`, or any other translation file, it will try these URLs in this order:

1. `/sites/default/files/able-player/translations/<lang>.json`
2. `/libraries/tothom-ableplayer-drupal/translations/<lang>.json`

This means:

- Custom or overridden translation files should be placed in `web/sites/default/files/able-player/translations/`.
- The packaged fallback translations must remain available in `web/libraries/tothom-ableplayer-drupal/translations/`.
- If the package is served from any location other than `/web/libraries/tothom-ableplayer-drupal`, these built-in paths will not work unless you modify the constants in `custom-ableplayer/custom-player.js`.

### Base player markup

```html
<video
  id="video1"
  data-able-player
  data-skin="2020"
  preload="metadata"
  width="auto"
  height="auto"
  playsinline>
</video>
```

Recommended responsive wrapper:

```css
.video-container {
  width: 600px;
  max-width: 100%;
}
```

## Video source options

- YouTube: `data-youtube-id="VIDEO_ID"`
- Vimeo: `data-vimeo-id="VIDEO_ID"`
- Local file:

```html
<source type="video/mp4" src="assets/example.mp4" />
```

## Tracks

### Captions/Subtitles

```html
<track kind="subtitles" src="assets/subtitles_es.vtt" srclang="es" label="Español" />
```

`kind` can be:
- `subtitles`
- `captions`

### Audio description

- YouTube described version: `data-youtube-desc-id="VIDEO_ID"`
- Vimeo described version: `data-vimeo-desc-id="VIDEO_ID"`
- Local descriptions track:

```html
<track kind="descriptions" src="assets/descriptions_en.vtt" srclang="en" label="English" />
```

### Chapters

```html
<track kind="chapters" src="assets/chapters_en.vtt" srclang="en" label="Speakers" />
```

### Transcript

Modal transcript: include captions/captions-like track.

Fixed transcript:
1. Add `data-transcript-div="transcript"` to `<video>`.
2. Add the target container:

```html
<div class="transcript-container">
  <section id="transcript" aria-label="Transcript"></section>
</div>
```

## Player language

By default, labels follow the page language (for example `<html lang="ca">`).

To force a specific player language:

```html
<video data-lang="fr" ...>
```

## WebVTT quick format

Time format:

```text
HH:MM:SS.mmm --> HH:MM:SS.mmm
```

Meaning:
- `HH`: hours
- `MM`: minutes
- `SS`: seconds
- `mmm`: milliseconds

Minimal file:

```text
WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome to the video.
```

## Language coverage

The custom layer currently supports the same language set declared in `custom-ableplayer/custom-player.js` and shipped as JSON files in `/translations`.

Supported language codes:
- `ab` Abkhazian
- `am` Amharic
- `ar` Arabic
- `as` Assamese
- `bh` Bihari
- `bg` Bulgarian
- `ca` Catalan
- `cs` Czech
- `cu` Church Slavic
- `da` Danish
- `de` German
- `dv` Divehi
- `el` Greek
- `en` English
- `es` Spanish
- `eu` Basque
- `fr` French
- `gl` Galician
- `gn` Guarani
- `gu` Gujarati
- `hr` Croatian
- `hu` Hungarian
- `it` Italian
- `iu` Inuktitut
- `ja` Japanese
- `km` Khmer
- `kn` Kannada
- `kv` Komi
- `mi` Maori
- `nb` Norwegian Bokmal
- `nl` Dutch
- `nn` Norwegian Nynorsk
- `no` Norwegian
- `oc` Occitan
- `oc-aranes` Aranese
- `pl` Polish
- `pt` Portuguese
- `ro` Romanian
- `ru` Russian
- `sk` Slovak
- `sl` Slovenian
- `sr` Serbian
- `sv` Swedish
- `te` Telugu
- `ti` Tigrinya
- `uk` Ukrainian
- `yi` Yiddish
- `zh` Chinese

## License

- Able Player core files: MIT (see `ableplayer/LICENSE`)
- TOTHOM custom layer: proprietary (see `custom-ableplayer/LICENSE`)
