/* =============================================================================
 ======================== CUSTOM SCRIPT FOR ABLE PLAYER ========================
 ============================================================================ */

/* ═══════════════════════════════════════════════════════════════════════════
   VOLUME SLIDER - DYNAMIC COLOR / CURSOR CANCELLATION AREA
══════════════════════════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  // Global variables
  var volumeSliderInitialized = false;
  var currentVolSlider = null;
  var currentVolStartVal = null;
  var debugVolumeOverlay = false; // set true to enable visual marker
  var $volOverlay = null;
  
  
  var tolX = 12;   // horizontal pixels
  var tolY = 15;   // vertical pixels
  
  
  function updateVolumeSliderBackground($range) {
    if (!$range || $range.length === 0) return;

    var val = parseFloat($range.val()) || 0;
    var min = parseFloat($range.attr('min')) || 0;
    var max = parseFloat($range.attr('max')) || 100;

    val = Math.max(min, Math.min(max, val));

    // Calculate percentage
    var percent = min === max ? 0 : ((val - min) / (max - min)) * 100;

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    var direction = isFirefox ? 'to top' : 'to right';

    // Create gradient: white to percentage, gray from percentage
    var gradient = 'linear-gradient(' + direction + ', ' +
      'rgb(255, 255, 255) 0%, ' +
      'rgb(255, 255, 255) ' + percent + '%, ' +
      'rgb(138, 138, 138) ' + percent + '%, ' +
      'rgb(138, 138, 138) 100%)';

    // Apply gradient
    $range.css('background', gradient);

    // Debug info
    if (debugVolumeOverlay) {
      console.log('Volume slider updated:', {
        val: val,
        min: min,
        max: max,
        percent: percent,
        direction: direction
      });
    }
  }

  // Initialize all volume sliders
  function initializeVolumeSliders() {
    $('.able-volume-slider input[type=range]').each(function () {
      var $slider = $(this);

      if (!$slider.attr('min')) $slider.attr('min', '0');
      if (!$slider.attr('max')) $slider.attr('max', '100');
      if (!$slider.val()) $slider.val('100'); // Default volume at 100%

      // Apply initial background
      updateVolumeSliderBackground($slider);
    });

    volumeSliderInitialized = true;
  }

  function detectNewVolumeSliders() {
    var observer = new MutationObserver(function (mutations) {
      var shouldUpdate = false;

      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              var $node = $(node);
              if ($node.hasClass('able-volume-slider') ||
                $node.find('.able-volume-slider').length > 0 ||
                $node.is('input[type=range]') && $node.closest('.able-volume-slider').length > 0) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        setTimeout(function () {
          initializeVolumeSliders();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function setupVolumeSliderEvents() {
    // Remove previous events
    $(document).off('mousedown.ableVolDrag mouseup.ableVolDrag');

    // Mouse down - start drag
    $(document).on('mousedown.ableVolDrag', '.able-volume-slider input[type=range]', function (e) {
      currentVolSlider = this;
      currentVolStartVal = $(this).val();

      if (debugVolumeOverlay) {
        showDebugOverlay(this);
      }
    });

    // Mouse up - end drag
    $(document).on('mouseup.ableVolDrag', function (e) {
      if (!currentVolSlider) return;

      var rect = currentVolSlider.getBoundingClientRect();
      var inside = (
        e.clientX >= rect.left - tolX &&
        e.clientX <= rect.right + tolX &&
        e.clientY >= rect.top - tolY &&
        e.clientY <= rect.bottom + tolY
      );

      if (!inside) {
        // Cancel change and restore initial value
        $(currentVolSlider).val(currentVolStartVal).trigger('input').trigger('change');
      }

      // Clear debug overlay
      if ($volOverlay) {
        $volOverlay.remove();
        $volOverlay = null;
      }

      // Reset variables
      currentVolSlider = null;
      currentVolStartVal = null;
    });
  }

  // Show debug overlay
  function showDebugOverlay(slider) {
    if (!debugVolumeOverlay) return;

    var rect = slider.getBoundingClientRect();
    $volOverlay = $('<div>', {
      id: 'vol-debug-overlay'
    }).css({
      position: 'fixed',
      left: (rect.left - tolX) + 'px',
      top: (rect.top - tolY) + 'px',
      width: (rect.width + tolX * 2) + 'px',
      height: (rect.height + tolY * 2) + 'px',
      border: '2px dashed rgba(0,255,0,0.7)',
      'pointer-events': 'none',
      'z-index': 2147483647
    });
    $('body').append($volOverlay);
  }

  $(document).ready(function () {
    // Initialize existing sliders
    initializeVolumeSliders();

    // Configure events
    setupVolumeSliderEvents();

    // Detect new sliders
    detectNewVolumeSliders();

    // Event for value changes
    $(document).on('input change', '.able-volume-slider input[type=range]', function () {
      updateVolumeSliderBackground($(this));
    });

    $(document).on('click', '.able-volume-button', function () {
      setTimeout(function () {
        initializeVolumeSliders();
      }, 150);
    });

    // Custom AblePlayer event
    $(document).on('ableplayer-volume-slider-created', function () {
      setTimeout(function () {
        initializeVolumeSliders();
      }, 50);
    });
  });

})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════
   MODIFICAR MIDA ICONA PLAY (SVG) - viewBox
══════════════════════════════════════════════════════════════════════════════ */

(function patchAblePlayerPlayViewBox() {
  function applyPatch() {
    if (!window.AblePlayer || !AblePlayer.prototype || !AblePlayer.prototype.getIconData) {
      return false;
    }

    var origGetIconData = AblePlayer.prototype.getIconData;

    // Replace with a wrapper
    AblePlayer.prototype.getIconData = function (button) {
      var svg = origGetIconData.call(this, button);

      if (button === 'play' && Array.isArray(svg)) {

        svg = svg.slice(0);
        svg[0] = '0 0 20 20';
      }
      return svg;
    };
    return true;
  }

  // Try applying patch immediately
  if (applyPatch()) return;

  var onReady = function () { applyPatch(); };
  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady);
})();

/* ═══════════════════════════════════════════════════════════════════════════
    BOTÓ DE TANCAMENT DEL DIÀLEG ACCESSIBLE --> DE TEXT A SVG
══════════════════════════════════════════════════════════════════════════════ */

(function ($) {
  var OldAccessibleDialog = window.AccessibleDialog;

  function NewAccessibleDialog() {
    OldAccessibleDialog.apply(this, arguments);

    var $btn = this.modal && this.modal.find('.modalCloseButton').first();
    if (!$btn || !$btn.length) return;

    if ($btn.find('svg, img').length) return;

    var label = $btn.attr('aria-label') || $btn.text() || 'Tanca';

    var svgData = (window.AblePlayer && AblePlayer.prototype.getIconData)
      ? AblePlayer.prototype.getIconData('close')
      : null;

    $btn.empty();

    if (svgData && svgData[0] && svgData[1]) {
      var svgNS = 'http://www.w3.org/2000/svg';

      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', svgData[0]);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('class', (svgData[2] || 'icon-close') + ' able-inline-svg');

      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', svgData[1]);

      path.setAttribute('fill', 'currentColor');

      svg.appendChild(path);
      $btn.append(svg);
    } 
    else {
      $btn.text('×');
    }

    if (!$btn.attr('aria-label')) {
      var $sr = $('<span>', { 'class': 'able-clipped', text: label });
      $btn.append($sr);
    }
  }

  NewAccessibleDialog.prototype = Object.create(OldAccessibleDialog.prototype);
  NewAccessibleDialog.prototype.constructor = NewAccessibleDialog;
  window.AccessibleDialog = NewAccessibleDialog;

  if (!document.getElementById('able-close-css')) {
    var style = document.createElement('style');
    style.id = 'able-close-css';
    style.appendChild(document.createTextNode(
      '.modalCloseButton .able-inline-svg{width:1.1em;height:1.1em;display:inline-block;vertical-align:middle}'
    ));
    document.head.appendChild(style);
  }
})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════
   BOTÓ DE TANCAMENT DELS ABLE-ALERT --> DE TEXT A SVG
══════════════════════════════════════════════════════════════════════════════ */

(function ($) {

  function replaceAlertCloseButton($alert) {
    if (!$alert || !$alert.length) return;

    var $btn = $alert.find('button[aria-label="Dismiss"], button:contains("×")').first();
    if (!$btn || !$btn.length) return;

    if ($btn.find('svg, img').length) return;

    var label = $btn.attr('aria-label') || 'Dismiss';

    var svgData = (window.AblePlayer && AblePlayer.prototype.getIconData)
      ? AblePlayer.prototype.getIconData('close')
      : null;

    $btn.empty();

    if (svgData && svgData[0] && svgData[1]) {
      var svgNS = 'http://www.w3.org/2000/svg';

      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', svgData[0]);
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('class', (svgData[2] || 'icon-close') + ' able-inline-svg');

      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', svgData[1]);

      path.setAttribute('fill', 'currentColor');

      svg.appendChild(path);
      $btn.append(svg);
    } 
    else {
      // Fallback if AblePlayer is not available
      $btn.text('×');
    }

    if (!$btn.attr('aria-label')) {
      var $sr = $('<span>', { 'class': 'able-clipped', text: label });
      $btn.append($sr);
    }
  }

  function processExistingAlerts() {
    $('.able-alert').each(function () {
      replaceAlertCloseButton($(this));
    });
  }

  function setupAlertObserver() {
    var observer = new MutationObserver(function (mutations) {
      var shouldProcess = false;

      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              var $node = $(node);
              if ($node.hasClass('able-alert') ||
                $node.find('.able-alert').length > 0) {
                shouldProcess = true;
              }
            }
          });
        }
      });

      if (shouldProcess) {
        setTimeout(function () {
          processExistingAlerts();
        }, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  $(document).ready(function () {
    // Processar alerts existents
    processExistingAlerts();

    // Configurar observer per nous alerts
    setupAlertObserver();
  });

  if (!document.getElementById('able-alert-close-css')) {
    var style = document.createElement('style');
    style.id = 'able-alert-close-css';
    style.appendChild(document.createTextNode(
      '.able-alert button .able-inline-svg{width:1em;height:1em;display:inline-block;vertical-align:middle}'
    ));
    document.head.appendChild(style);
  }
})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════
   MODIFICAR TEMPS DE DESAPARICIÓ DE L'ABLE-ALERT (30s → 5s)
══════════════════════════════════════════════════════════════════════════════ */

(function ($) {
  function patchShowAlert() {
    if (!window.AblePlayer || !AblePlayer.prototype.showAlert) {
      return false;
    }

    var originalShowAlert = AblePlayer.prototype.showAlert;

    AblePlayer.prototype.showAlert = function (msg, location = 'main') {

      var thisObj, $alertBox, $parentWindow;

      thisObj = this;
      $alertBox = thisObj.$alertBox;
      $parentWindow = thisObj.$ableDiv;
      if (location === 'transcript') {
        $parentWindow = thisObj.$transcriptArea;
      } 
      else if (location === 'sign') {
        $parentWindow = thisObj.$signWindow;
      } 
      else if (location === 'screenreader') {
        $alertBox = thisObj.$srAlertBox;
      }
      $alertBox.find('span').text(msg);
      $alertBox.appendTo($parentWindow)
      $alertBox.css({ 'display': 'flex' });

      if (location !== 'screenreader') {
        setTimeout(function () {
          $alertBox.fadeOut(300);
        }, 5000); // 5 segons en lloc de 30
      }

      // FIX: Solucionar problema del role="alert" quan l'element es mou al DOM

      $alertBox.removeAttr('role');
      setTimeout(function () {
        $alertBox.attr('role', 'alert');
      }, 10);

    };

    return true;
  }

  if (patchShowAlert()) return;

  var onReady = function () {
    if (!patchShowAlert()) {
      setTimeout(patchShowAlert, 100);
    }
  };

  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady);
})();

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   TRADUCCIÓ DE TEXTOS ACCESSIBLESLIDER (HORES, MINUTS, SEGONS)
═════════════════════════════════════════════════════════════════════════════════════════════════ */

(function ($) {

  var OldAccessibleSlider = window.AccessibleSlider;

  function CustomAccessibleSlider(mediaType, div, orientation, length, min, max, bigInterval, label, className, trackingMedia, initialState, tt) {
    // Crida al constructor original
    OldAccessibleSlider.call(this, mediaType, div, orientation, length, min, max, bigInterval, label, className, trackingMedia, initialState);

    this.tt = tt;
  }

  // Estableix la cadena de prototipus
  CustomAccessibleSlider.prototype = Object.create(OldAccessibleSlider.prototype);
  CustomAccessibleSlider.prototype.constructor = CustomAccessibleSlider;

  window.AccessibleSlider = CustomAccessibleSlider;

  // Sobrescriptura d’addControls

  var oldAddControls = AblePlayer.prototype.addControls;
  AblePlayer.prototype.addControls = function () {

    oldAddControls.apply(this, arguments);

    if (this.skin === '2020' && this.seekBar) {
      this.seekBar.tt = this.tt;
    }
  };

  // Sobrescriptura d’updateAriaValues

  // The 'tt' translation table is now used (if undefined, default values are used)
  var oldUpdateAriaValues = AccessibleSlider.prototype.updateAriaValues;
  AccessibleSlider.prototype.updateAriaValues = function (position, updateLive) {
    // Use this.tt if it exists, or create a default object
    var tt = this.tt || {
      hour: 'hour',
      hours: 'hours',
      minute: 'minute',
      minutes: 'minutes',
      second: 'second',
      seconds: 'seconds'
    };

    var pHours = Math.floor(position / 3600);
    var pMinutes = Math.floor((position % 3600) / 60);
    var pSeconds = Math.floor(position % 60);

    var pHourWord = pHours === 1 ? tt.hour : tt.hours;
    var pMinuteWord = pMinutes === 1 ? tt.minute : tt.minutes;
    var pSecondWord = pSeconds === 1 ? tt.second : tt.seconds;

    var descriptionText;
    if (pHours > 0) {
      descriptionText = pHours + ' ' + pHourWord + ', ' + pMinutes + ' ' + pMinuteWord + ', ' + pSeconds + ' ' + pSecondWord;
    } 
    else if (pMinutes > 0) {
      descriptionText = pMinutes + ' ' + pMinuteWord + ', ' + pSeconds + ' ' + pSecondWord;
    } 
    else {
      descriptionText = pSeconds + ' ' + pSecondWord;
    }

    if (!this.liveAriaRegion) {
      this.liveAriaRegion = $('<span>', {
        'class': 'able-offscreen',
        'aria-live': 'polite'
      });
      this.wrapperDiv.append(this.liveAriaRegion);
    }
    if (updateLive && (this.liveAriaRegion.text() !== descriptionText)) {
      this.liveAriaRegion.text(descriptionText);
    }

    // Update seekHead ARIA attributes
    this.seekHead.attr('aria-valuetext', descriptionText);
    this.seekHead.attr('aria-valuenow', Math.floor(position).toString());
  };

})(jQuery);

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════
   ACTUALITZAR ATRIBUTS PER TAL QUE EL LECTOR DE PANTALLA LLEGEIXI ELS SUBTÍTOLS I TAMBÉ HI VAGI EL FOCUS
═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
(function ($) {
  AblePlayer.prototype.setupCaptions = function (track, cues) {

    // Setup player for display of captions (one track at a time)
    var thisObj, captions, inserted, i, capLabel;

    // Insert track into captions array 
    // in its proper alphabetical sequence by label  
    if (typeof cues === 'undefined') {
      cues = null;
    }

    if (this.usingYouTubeCaptions || this.usingVimeoCaptions) {
      // this.captions has already been populated 
      // For YouTube, this happens in youtube.js > getYouTubeCaptionTracks()
      // For Vimeo, this happens in vimeo.js > getVimeoCaptionTracks() 
      // So, nothing to do here... 
    }
    else {
      if (this.captions.length === 0) { // this is the first	
        this.captions.push({
          'language': track.language,
          'label': track.label,
          'def': track.def,
          'kind': track.kind || 'subtitles',
          'cues': cues
        });
      }
      else { // there are already captions in the array			
        inserted = false;
        for (i = 0; i < this.captions.length; i++) {
          capLabel = track.label;
          
          if (capLabel.toLowerCase() < this.captions[i].label.toLowerCase()) {
            // insert before track i
            this.captions.splice(i, 0, {
              'language': track.language,
              'label': track.label,
              'def': track.def,
              'kind': track.kind || 'subtitles',
              'cues': cues
            });
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          // just add track to the end
          this.captions.push({
            'language': track.language,
            'label': track.label,
            'def': track.def,
            'kind': track.kind || 'subtitles',
            'cues': cues
          });
        }
      }
    }

    // there are captions available 
    this.hasCaptions = true;
    this.currentCaption = -1;
    if (this.prefCaptions === 1) {
      this.captionsOn = true;
    } 
    else if (this.prefCaptions === 0) {
      this.captionsOn = false;
    } 
    else {
      // user has no prefs. Use default state.
      if (this.defaultStateCaptions === 1) {
        this.captionsOn = true;
      } 
      else {
        this.captionsOn = false;
      }
    }
    if (this.mediaType === 'audio' && this.captionsOn) {
      this.$captionsContainer.removeClass('captions-off');
    }

    if (!this.$captionsWrapper ||
      (this.$captionsWrapper && !($.contains(this.$ableDiv[0], this.$captionsWrapper[0])))) {
      // captionsWrapper either doesn't exist, or exists in an orphaned state 
      // Either way, it needs to be rebuilt...  
      this.$captionsDiv = $('<div>', {
        'class': 'able-captions',
        'tabindex': 0,
        'lang': track.language
      });
      this.$captionsWrapper = $('<div>', {
        'class': 'able-captions-wrapper',
        'aria-hidden': 'false',
        'aria-live': 'polite',
        'aria-atomic': 'true',
        'lang': track.language
      }).hide();
      if (this.prefCaptionsPosition === 'below') {
        this.$captionsWrapper.addClass('able-captions-below');
      } 
      else {
        this.$captionsWrapper.addClass('able-captions-overlay');
      }
      this.$captionsWrapper.append(this.$captionsDiv);
      this.$captionsContainer.append(this.$captionsWrapper);
    }
  };

})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   ACTUALITZA L'ATRIBUT LANG SEGONS L'IDIOMA SELECCIONAT A TOT EL CONTENIDOR DEL CAPTIONS I AL DIV DEL CAPTIONS
══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

(function ($) {
  AblePlayer.prototype.showCaptions = function (now) {

    var c, thisCaption, captionText;
    var cues;
    if (this.selectedCaptions.cues.length) {
      cues = this.selectedCaptions.cues;
    }
    else if (this.captions.length >= 1) {
      cues = this.captions[0].cues;
    }
    else {
      cues = [];
    }
    for (c = 0; c < cues.length; c++) {
      if ((cues[c].start <= now) && (cues[c].end > now)) {
        thisCaption = c;
        break;
      }
    }
    if (typeof thisCaption !== 'undefined') {
      if (this.currentCaption !== thisCaption) {
        // it's time to load the new caption into the container div
        captionText = this.flattenCueForCaption(cues[thisCaption]).replace('\n', '<br>');
        this.$captionsDiv.html(captionText);

        if (this.selectedCaptions && this.selectedCaptions.language) {
          this.$captionsDiv.attr('lang', this.selectedCaptions.language);
        }

        if (this.selectedCaptions && this.selectedCaptions.language) {
          this.$captionsWrapper.attr('lang', this.selectedCaptions.language);
        }

        this.currentCaption = thisCaption;
        if (captionText.length === 0) {
          // hide captionsDiv; otherwise background-color is visible due to padding
          this.$captionsDiv.css('display', 'none');
        }
        else {
          this.$captionsDiv.css('display', 'inline-block');
        }
      }
    }
    else {
      this.$captionsDiv.html('').css('display', 'none');
      this.currentCaption = -1;
    }
  };

})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════
   Afegir l'idioma ARANÈS (oc-aranes) a la llista d'idiomes suportats
══════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

(function ($) {

  AblePlayer.prototype.getSupportedLangs = function () {
    // returns an array of languages for which AblePlayer has translation tables        
    var langs = ['ca', 'cs', 'da', 'de', 'en', 'es', 'fr', 'he', 'id', 'it', 'ja', 'ms', 'nb', 'nl', 'oc-aranes', 'pl', 'pt', 'pt-br', 'sv', 'tr', 'zh-tw'];
    return langs;
  };


})(jQuery);

(function ($) {

  var isoLangs = {
    "oc-aranes": {
      "name": "Aranese",
      "nativeName": "Aranés"
    },
  }
  
})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
  Redimensionar àrea de transcripció i marge inferior intern
═══════════════════════════════════════════════════════════════════════ */

(function () {
  var origResizeObject = AblePlayer.prototype.resizeObject;

  AblePlayer.prototype.resizeObject = function (which, width, height) {

    origResizeObject.apply(this, arguments);

    if (which === 'transcript') {
      var toolbarHeight = this.$transcriptArea ? (this.$transcriptArea.find('.able-window-toolbar').outerHeight(true) || 0) : 0;
      var paddingAndBorder = 16; // marge de seguretat mínim

      var chromeHeight = toolbarHeight + paddingAndBorder;
      var innerHeight = Math.max(0, height - chromeHeight);

      this.$transcriptDiv.css('height', innerHeight + 'px');
    }
  };
})();

(function () {
  var origEndDrag = AblePlayer.prototype.endDrag;

  AblePlayer.prototype.endDrag = function (which) {
    origEndDrag.apply(this, arguments);
    if (which === 'transcript' && this.$transcriptArea && this.$transcriptDiv) {
      var width = this.$transcriptArea.outerWidth();
      var height = this.$transcriptArea.outerHeight();
      this.resizeObject('transcript', width, height);
    }
  };
})();

/* ══════════════════════════════════════════════════════════════════════
   Evitar que el botó de redimensionar la transcripció quedi "enganxat"
═══════════════════════════════════════════════════════════════════════ */

(function () {
  var origStartResize = AblePlayer.prototype.startResize;

  AblePlayer.prototype.startResize = function (which, $element) {
    var result = origStartResize.apply(this, arguments);
    var thisObj = this;

    $(document).off('mouseup.ableForceResizeEnd touchend.ableForceResizeEnd').on('mouseup.ableForceResizeEnd touchend.ableForceResizeEnd', function () {
      if (thisObj.resizing) {
        thisObj.endResize(which);
      }
      $(document).off('mouseup.ableForceResizeEnd touchend.ableForceResizeEnd');
    });

    return result;
  };
})();

/* ══════════════════════════════════════════════════════════════════════
    Treure opcions del menú de preferències si no hi ha els tracks corresponents
 ═══════════════════════════════════════════════════════════════════════ */

(function ($) {

  var originalCreatePopup = AblePlayer.prototype.createPopup;

  AblePlayer.prototype.createPopup = function (which, tracks) {
    var thisObj = this;

    if (which !== 'prefs') {
      return originalCreatePopup.call(this, which, tracks);
    }

    // Cache results to avoid repeated calls
    var hasTextTracks = this.mediaElement && this.mediaElement.textTracks && this.mediaElement.textTracks.length > 0;
    var hasMediaElement = this.$media && this.$media.length > 0;

    var hasTracksByKind = function (kind) {
      if (!hasTextTracks) return false;
      for (var t = 0; t < this.mediaElement.textTracks.length; t++) {
        if (this.mediaElement.textTracks[t].kind === kind) return true;
      }
      return false;
    }.bind(this);

    var hasHtmlTracks = function (selector) {
      return hasMediaElement && this.$media.find(selector).length > 0;
    }.bind(this);

    var hasYouTubeCaptions = function () {
      return this.player === 'youtube' && (
        (this.youtubeCaptions && this.youtubeCaptions.length > 0) ||
        (this.captions && this.captions.length > 0) ||
        hasTextTracks ||
        hasHtmlTracks('track')
      );
    }.bind(this);

    var hasVimeoCaptions = function () {
      return this.player === 'vimeo' && this.vimeoCaptions && this.vimeoCaptions.length > 0;
    }.bind(this);

    var prefConditions = {
      'descriptions': function () {
        return hasTracksByKind('descriptions') ||
          hasHtmlTracks('track[kind="descriptions"]') ||
          (this.player === 'youtube' && (this.youtubeDescId || this.$media.attr('data-youtube-desc-id'))) ||
          (this.player === 'vimeo' && this.vimeoDescId);
      },
      'captions': function () {
        return hasTracksByKind('captions') || hasTracksByKind('subtitles') ||
          hasHtmlTracks('track[kind="captions"], track[kind="subtitles"]') ||
          hasYouTubeCaptions() || hasVimeoCaptions();
      },
      'transcript': function () {
        var includeTranscript = this.$media.attr('data-include-transcript');

        if (includeTranscript === 'false') {
          return !!(this.transcriptDiv || this.$media.attr('data-transcript-div'));
        }

        return hasTextTracks ||
          hasHtmlTracks('track') ||
          hasYouTubeCaptions() ||
          hasVimeoCaptions() ||
          (this.transcriptType && this.transcriptType !== 'external') ||
          (this.transcriptDiv || this.$media.attr('data-transcript-div'));
      },
      'keyboard': function () { return true; } // Sempre incloure
    };

    // Mapeig de textos i dialogs
    var prefConfig = {
      'captions': {
        text: this.tt.prefMenuCaptions,
        dialog: 'captionPrefsDialog'
      },
      'descriptions': {
        text: this.tt.prefMenuDescriptions,
        dialog: 'descPrefsDialog'
      },
      'keyboard': {
        text: this.tt.prefMenuKeyboard,
        dialog: 'keyboardPrefsDialog'
      },
      'transcript': {
        text: this.tt.prefMenuTranscript,
        dialog: 'transcriptPrefsDialog'
      }
    };

    var filteredPrefCats = this.prefCats.filter(function (prefCat) {
      return prefConditions[prefCat] && prefConditions[prefCat].call(this);
    }.bind(this));

    if (filteredPrefCats.length === 0) {
      return $('<ul>').hide();
    }

    var $menu = $('<ul>', {
      'id': this.mediaId + '-' + which + '-menu',
      'class': 'able-popup',
      'role': 'menu'
    }).hide();

    filteredPrefCats.forEach(function (prefCat) {
      var config = prefConfig[prefCat];
      var $menuItem = $('<li>', {
        'role': 'menuitem',
        'tabindex': '-1',
        'text': config.text
      });

      $menuItem.on('click', function () {
        thisObj.showingPrefsDialog = true;
        thisObj.setFullscreen(false);
        thisObj[config.dialog].show();
        thisObj.closePopups();
        thisObj.showingPrefsDialog = false;
      });

      $menu.append($menuItem);
    });

    this.$prefsButton.attr('data-prefs-popup', 'menu');
    this.$controllerDiv.append($menu);
    return $menu;
  };

})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
   Nova opció "About" al menú de preferències
═══════════════════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';
  if (typeof AblePlayer === 'undefined') return;

  const buildType = 'web'; // Opcions: 'web', 'wp'
  const productVersions = {
    web: { nameKey: 'productNameWeb', descKey: 'webEditionDescription' },
    wp: { nameKey: 'productNameWp', descKey: 'wpEditionDescription' }
  };
  const PRODUCT = productVersions[buildType];
  const PRODUCT_VERSION = 'v1.1.2';
  const ENGINE_VERSION = 'Able Player v4.7.0';
  const CURRENT_YEAR = new Date().getFullYear();

  // Helper de traduccions
  function t(player, key, fb) {
    return (player.tt && player.tt[key]) ? player.tt[key] : (fb || key);
  }

  AblePlayer.prototype.buildAboutDialog = function () {
    if (this.aboutDialog) return;

    const productName = t(this, PRODUCT.nameKey);
    const dialogTitle = t(this, 'aboutTitle');
    const closeText = t(this, 'closeButtonLabel', 'Close');
    const $content = $('<div>', {
      'class': 'able-about able-modal-dialog'
    });

    $content.append(
      $('<h2>').text(`${productName} ${PRODUCT_VERSION}`),
      $('<p>', { 'class': 'able-about-copyright' }).text(
        `© ${CURRENT_YEAR} ${t(this, 'copyrightSuffix')}`
      ),
      $('<p>').text(t(this, PRODUCT.descKey)),
      $('<hr>')
    );

    $content.append(
      $('<h2>').text(t(this, 'thirdPartyComponents')),
      $('<p>').text(t(this, 'thirdPartyDescription')),
      $('<h3>').text(ENGINE_VERSION),
      $('<p>').text(t(this, 'ablePlayerCopyright')),
      $('<p>').html(
        `${t(this, 'distributedUnder')} <a href="https://opensource.org/license/MIT" target="_blank" rel="noopener noreferrer">${t(this, 'mitLicense')}</a>`
      ),
      $('<hr>')
    );

    $content.append(
      $('<h2>').text(t(this, 'moreInfoTitle')),

      $('<ul>', { 'class': 'able-about-more-info-list' }).append(

        $('<li>').html(
          `${t(this, 'originalProject')}: <a href="https://ableplayer.github.io/ableplayer/" target="_blank" rel="noopener noreferrer">ableplayer.github.io</a>`
        ),

        $('<li>').html(
          `${t(this, 'developedBy')}: <a href="https://www.tothomweb.com" target="_blank" rel="noopener noreferrer">TOTHOMweb.com</a>`
        )
      )
    );

    $('body').append($content);
    if (typeof AccessibleDialog !== 'function') {
      $content.attr({ role: 'dialog', 'aria-label': dialogTitle, tabindex: -1 }).hide();
      this.aboutDialog = {
        show: () => $content.show().focus(),
        hide: () => $content.hide()
      };
    } 
    else {
      this.aboutDialog = new AccessibleDialog($content, this.$prefsButton, 'dialog', true, dialogTitle, $('<p class="able-offscreen">'), closeText);
    }
  };

  AblePlayer.prototype.showAboutDialog = function () {
    this.buildAboutDialog();
    if (typeof this.closePopups === 'function') this.closePopups();
    this.aboutDialog.show();
  };

  const _origCreatePopup = AblePlayer.prototype.createPopup;
  AblePlayer.prototype.createPopup = function (which, tracks) {
    const $menu = _origCreatePopup.apply(this, arguments);
    if (which === 'prefs' && $menu && $menu.length) {
      if (!$menu.find('.able-menuitem-about').length) {
        const label = t(this, 'about', 'Quant a');
        const $item = $('<li>', { class: 'able-menuitem-about', role: 'menuitem', tabindex: '-1', text: label });
        $item.on('click keydown', (e) => {
          const isActivate = (e.type === 'click') || (e.key === 'Enter' || e.key === ' ' || e.which === 13 || e.which === 32);
          if (isActivate) { e.preventDefault(); this.showAboutDialog(); }
        });
        $menu.append($item);
      }
    }
    return $menu;
  };

})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
   Augmentar l'ample inicial de les finestres arrossegables (transcripció i signes)
═══════════════════════════════════════════════════════════════════════ */

(function () {
  AblePlayer.prototype.getDefaultWidth = function (which) {
    let viewportMaxwidth = window.innerWidth;
    if (which === 'transcript') {
      return (viewportMaxwidth <= 500) ? viewportMaxwidth : 500;
    } 
    else if (which === 'sign') {
      return (viewportMaxwidth <= 400) ? viewportMaxwidth : 400;
    }
  };
})();

/* ══════════════════════════════════════════════════════════════════════
   Aplicar gap vertical quan la finestra de signes o transcripció està a sota del vídeo
═══════════════════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  if (!window.AblePlayer) return;

  var gap = 5;

  var originalPositionDraggableWindow = AblePlayer.prototype.positionDraggableWindow;

  AblePlayer.prototype.positionDraggableWindow = function (which, width) {

    originalPositionDraggableWindow.apply(this, arguments);

    if (which === 'sign' && this.$signWindow) {

      var position = this.$signWindow.css('position');

      if (position === 'relative') {

        this.$signWindow.css('margin-top', gap + 'px');
      } 
      else {

        this.$signWindow.css('margin-top', '0');
      }
    }

    if (which === 'transcript' && this.$transcriptArea) {
      var position = this.$transcriptArea.css('position');

      if (position === 'relative') {
        this.$transcriptArea.css('margin-top', gap + 'px');
      } 
      else {
        this.$transcriptArea.css('margin-top', '0');
      }
    }
  };

})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
   Subtítols: separar toggle i selector d'idioma (criteri 7.3) i millores
   - Button nou de CC toggle; el botó CC original passa a ser selector d'idioma/AD
   - Menú d'idioma accessible (tab/tecles, focus mòbil, grups Captions/AD)
   - Reordena botons (toggle, AD, LS, transcript, idioma, capítols)
   - Tria pista per defecte (prioritza captions def) i posa icona de llengua
   - Ajusta etiquetes d'audio-descripció i afegeix tooltip coherent
═══════════════════════════════════════════════════════════════════════ */

(function ($) {
  if (!window.AblePlayer) return;

  function getPreferredCaptionTrack(player) {
    if (!player.captions || !player.captions.length) return null;
    var caps = player.captions;
    var byKindAndDef = caps.find(function (c) { return c.def === true && c.kind === 'captions'; });
    if (byKindAndDef) return byKindAndDef;
    var byDef = caps.find(function (c) { return c.def === true; });
    if (byDef) return byDef;
    var byKind = caps.find(function (c) { return c.kind === 'captions'; });
    if (byKind) return byKind;
    return caps[0];
  }

  var _addControls = AblePlayer.prototype.addControls;
  var _refresh = AblePlayer.prototype.refreshControls;
  var _onClick = AblePlayer.prototype.onClickPlayerButton;
  var _origHandleCaptionToggle = AblePlayer.prototype.handleCaptionToggle;

  function getDescLabel(track) {
    if (!track) return '';
    return track.label || track.language || 'AD';
  }

  function hasOpenDescription(player) {
    if (!player) return false;
    if (player.hasOpenDesc) return true;
    if (player.youTubeDescId || player.vimeoDescId) return true;
    if (player.$media && (player.$media.attr('data-youtube-desc-id') || player.$media.attr('data-vimeo-desc-id'))) return true;
    if (player.$sources && player.$sources.length && player.$sources.first().attr('data-desc-src')) return true;
    return false;
  }

  function getOpenDescTrackFromCaptions(player) {
    if (!hasOpenDescription(player)) return null;
    if (player.descriptions && player.descriptions.length) return null; // ja hi ha AD tancada

    var cap = null;
    if (player.selectedCaptions) {
      cap = player.selectedCaptions;
    } 
    else if (player.captions && player.captions.length) {
      cap = player.captions.find(function (c) { return c.def; }) || player.captions[0];
    } 
    else if (player.tracks && player.tracks.length) {
      for (var i = 0; i < player.tracks.length; i++) {
        if (player.tracks[i].kind === 'captions' || player.tracks[i].kind === 'subtitles') {
          cap = player.tracks[i];
          break;
        }
      }
    } 
    else if (player.$media && player.$media.length) {
      var $track = player.$media.find('track[kind="captions"], track[kind="subtitles"]').first();
      if ($track && $track.length) {
        cap = { language: $track.attr('srclang'), label: $track.attr('label') };
      }
    }

    if (!cap) return null;

    var lang = cap.language || player.lang;
    var label = cap.label || cap.language || lang || 'AD';
    return {
      language: lang,
      label: label,
      kind: 'descriptions',
      cues: []
    };
  }

(function ($) {
  if (!window.AblePlayer) return;
  // Keep the original AD track label when Able Player creates descriptions
  var _origSetupDescriptions = AblePlayer.prototype.setupDescriptions;
  AblePlayer.prototype.setupDescriptions = function (track, cues) {
    _origSetupDescriptions.apply(this, arguments);
    if (this.descriptions && this.descriptions.length) {
      var desc = this.descriptions[this.descriptions.length - 1];
      if (track && track.label) {
        desc.label = track.label;
      }
    }
  };
})(jQuery);

  function setLanguageIcon($button) {
    if (!$button || !$button.length) return;
    $button.find('svg,img').remove();
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'able-inline-svg icon-language');
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d',
      'M12,24C5.4,24,0,18.6,0,12S5.4,0,12,0s12,5.4,12,12S18.6,24,12,24z M9.5,17c0.6,3.1,1.7,5,2.5,5s1.9-1.9,2.5-5H9.5z     M16.6,17c-0.3,1.7-0.8,3.3-1.4,4.5c2.3-0.8,4.3-2.4,5.5-4.5H16.6z M3.3,17c1.2,2.1,3.2,3.7,5.5,4.5c-0.6-1.2-1.1-2.8-1.4-4.5H3.3    z M16.9,15h4.7c0.2-0.9,0.4-2,0.4-3s-0.2-2.1-0.5-3h-4.7c0.2,1,0.2,2,0.2,3S17,14,16.9,15z M9.2,15h5.7c0.1-0.9,0.2-1.9,0.2-3    S15,9.9,14.9,9H9.2C9.1,9.9,9,10.9,9,12C9,13.1,9.1,14.1,9.2,15z M2.5,15h4.7c-0.1-1-0.1-2-0.1-3s0-2,0.1-3H2.5C2.2,9.9,2,11,2,12    S2.2,14.1,2.5,15z M16.6,7h4.1c-1.2-2.1-3.2-3.7-5.5-4.5C15.8,3.7,16.3,5.3,16.6,7z M9.5,7h5.1c-0.6-3.1-1.7-5-2.5-5    C11.3,2,10.1,3.9,9.5,7z M3.3,7h4.1c0.3-1.7,0.8-3.3,1.4-4.5C6.5,3.3,4.6,4.9,3.3,7z');
    svg.appendChild(path);
    $button.append(svg);
  }

  function ensureLanguagePopup(thisObj) {
    if (thisObj.captionsPopup && thisObj.captionsPopup.length) {
      return thisObj.captionsPopup;
    }
    var $menu = $('<ul>', {
      id: thisObj.mediaId + '-captions-menu',
      'class': 'able-popup able-popup-captions',
      role: 'menu'
    }).hide();
    thisObj.$controllerDiv.append($menu);
    thisObj.captionsPopup = $menu;
    return $menu;
  }

  function focusLanguageMenuItem($menu, $item) {
    var selector = 'li[role="menuitemradio"]';
    var $items = $menu.find(selector);
    $items.attr('tabindex', '-1').removeClass('able-focus');
    if ($item && $item.length) {
      $item.attr('tabindex', '0').addClass('able-focus').trigger('focus');
    }
  }

  function buildLanguageMenu(thisObj) {
    var showSubs = thisObj.captionsOn && thisObj.captions && thisObj.captions.length;
    var adTracks = (thisObj.descriptions && thisObj.descriptions.length) ? thisObj.descriptions.slice() : [];
    var openDescTrack = getOpenDescTrackFromCaptions(thisObj);
    if (openDescTrack) {
      adTracks.push(openDescTrack);
      if (!thisObj.selectedDescriptions) {
        thisObj.selectedDescriptions = openDescTrack;
      }
    }
    var showAD = thisObj.descOn && adTracks.length;

    if (!showSubs && !showAD) return null;

    var $menu = ensureLanguagePopup(thisObj);
    $menu.empty();

    if (showSubs) {
      var captionsHeading = (thisObj.tt && thisObj.tt.prefHeadingCaptions) ? thisObj.tt.prefHeadingCaptions :
        (thisObj.tt && thisObj.tt.captions) ? thisObj.tt.captions : 'Captions';

      var $subsGroup = $('<li>', { 'class': 'able-lang-group able-lang-subs', role: 'presentation' });
      var $subsLabel = $('<span>', {
        'class': 'able-popup-heading',
        'aria-hidden': 'true'
      }).text(captionsHeading);
      var $subsList = $('<ul>', {
        'class': 'able-lang-list',
        role: 'group',
        'aria-label': captionsHeading
      });

      thisObj.captions.forEach(function (track) {
        var $item = $('<li>', {
          role: 'menuitemradio',
          tabindex: '-1',
          lang: track.language,
          'data-kind': 'captions',
          'aria-checked': (thisObj.selectedCaptions && thisObj.selectedCaptions.language === track.language) ? 'true' : 'false'
        }).text(track.label);
        $item.on('click', thisObj.getCaptionClickFunction(track));
        $subsList.append($item);
      });

      $subsGroup.append($subsLabel, $subsList);
      $menu.append($subsGroup);
    }

    if (showAD) {
      var adHeading = (thisObj.tt && thisObj.tt.prefMenuDescriptions) ? thisObj.tt.prefMenuDescriptions :
        (thisObj.tt && thisObj.tt.prefHeadingDescription) ? thisObj.tt.prefHeadingDescription : 'Audio Description';

      var $adGroup = $('<li>', { 'class': 'able-lang-group able-lang-ad', role: 'presentation' });
      var $adLabel = $('<span>', {
        'class': 'able-popup-heading',
        'aria-hidden': 'true'
      }).text(adHeading);
      var $adList = $('<ul>', {
        'class': 'able-lang-list',
        role: 'group',
        'aria-label': adHeading
      });

      adTracks.forEach(function (track) {
        var itemLabel = track.label || track.language || 'AD';
        var $item = $('<li>', {
          role: 'menuitemradio',
          tabindex: '-1',
          lang: track.language,
          'data-kind': 'descriptions',
          'aria-checked': (thisObj.selectedDescriptions && thisObj.selectedDescriptions.language === track.language) ? 'true' : 'false'
        }).text(itemLabel);
        $item.on('click', function () {
          thisObj.selectedDescriptions = track;
          thisObj.currentDescription = -1;
          thisObj.setDescriptionVoice();
          thisObj.showDescription(thisObj.elapsed);
          thisObj.closePopups();
        });
        $adList.append($item);
      });

      $adGroup.append($adLabel, $adList);
      $menu.append($adGroup);
    }

    var focusableSelector = 'li[role="menuitemradio"]';
    $menu.off('keydown').on('keydown.langmenu', function (e) {
      var $items = $menu.find(focusableSelector);
      if (!$items.length) return;

      var $current = $(document.activeElement);
      if (!$current.is(focusableSelector)) {
        $current = $items.first();
      }

      var currentIndex = $items.index($current);
      var nextIndex;
      var forward = (e.key === 'Tab' && !e.shiftKey) || e.key === 'ArrowDown' || e.key === 'ArrowRight';
      var backward = (e.key === 'Tab' && e.shiftKey) || e.key === 'ArrowUp' || e.key === 'ArrowLeft';

      if (forward) {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % $items.length;
        focusLanguageMenuItem($menu, $items.eq(nextIndex));
      } 
      else if (backward) {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + $items.length) % $items.length;
        focusLanguageMenuItem($menu, $items.eq(nextIndex));
      } 
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        $current.trigger('click');
      } 
      else if (e.key === 'Escape') {
        e.preventDefault();
        thisObj.closePopups();
        thisObj.$ccButton.attr('aria-expanded', 'false');
        thisObj.waitThenFocus(thisObj.$ccButton);
      }
    });

    return $menu;
  }

  AblePlayer.prototype.addControls = function () {
    _addControls.apply(this, arguments);

    if (!this.$ccButton && this.descriptions && this.descriptions.length) {

      var $langBtn = $('<div>', {
        role: 'button',
        tabindex: '0',
        'class': 'able-button-handler-captions able-lang-button',
        'aria-haspopup': 'true',
        'aria-expanded': 'false'
      });
      setLanguageIcon($langBtn);
      // Place it in the right container, before the first separator (able-pipe)
      var $right = this.$controllerDiv.find('.able-right-controls');
      if (!$right.length) $right = this.$controllerDiv;
      var $pipe = $right.find('.able-pipe').first();
      if ($pipe.length) {
        $langBtn.insertBefore($pipe);
      } 
      else {
        $right.append($langBtn);
      }
      this.$ccButton = $langBtn;
    }

    if (!this.$ccButton) return;

    this.$ccLanguageButton = this.$ccButton;

    setLanguageIcon(this.$ccLanguageButton);

    var toggleGone = !this.$ccToggleButton || !$.contains(document, this.$ccToggleButton[0]);
    if (toggleGone) {
      var tooltipId = this.mediaId + '-tooltip';
      var $toggle = $('<div>', {
        role: 'button',
        tabindex: '0',
        'class': 'able-button-handler-captions-toggle'
      });
      this.getIcon($toggle, 'captions');
      var label = this.captionsOn ? this.tt.hideCaptions : this.tt.showCaptions;
      this.setText($toggle, label);

      var thisObj = this;
      $toggle.on('mouseenter focus', function () {
        var buttonText = $(this).attr('aria-label');
        var position = $(this).position();
        var buttonHeight = $(this).height();
        var buttonWidth = $(this).width();
        var controllerWidth = thisObj.$controllerDiv.width();
        position.right = controllerWidth - position.left - buttonWidth;
        var tooltipY = position.top + buttonHeight + 5;
        var buttonSide = $(this).parent().hasClass('able-right-controls') ? 'right' : 'left';
        var tooltipWidth = AblePlayer.localGetElementById($toggle[0], tooltipId).text(buttonText).width();
        var tooltipX;
        var tooltipStyle;
        if (buttonSide === 'left') {
          tooltipX = position.left - tooltipWidth / 2;
          if (tooltipX < 0) tooltipX = 2;
          tooltipStyle = { left: tooltipX + 'px', right: '', top: tooltipY + 'px' };
        } 
        else {
          tooltipX = position.right - tooltipWidth / 2;
          if (tooltipX < 0) tooltipX = 2;
          tooltipStyle = { left: '', right: tooltipX + 'px', top: tooltipY + 'px' };
        }
        var tooltip = AblePlayer.localGetElementById($toggle[0], tooltipId).text(buttonText).css(tooltipStyle);
        thisObj.showTooltip(tooltip);
        $(this).on('mouseleave blur', function () {
          AblePlayer.localGetElementById($toggle[0], tooltipId).text('').hide();
        });
      });

      this.$ccLanguageButton.before($toggle);
      this.$ccToggleButton = $toggle;

      if (Array.isArray(this.controls) && this.controls.indexOf('captions-toggle') === -1) {
        this.controls.push('captions-toggle');
      }
    }

    // Reordenar amb l'ordre requerit:
    var $rightContainer = this.$controllerDiv.find('.able-right-controls');
    if (!$rightContainer.length) $rightContainer = this.$controllerDiv;
    var $pipe = $rightContainer.find('.able-pipe').first();
    var insertBeforePipe = function ($el) {
      if (!$el || !$el.length) return;
      $el.detach();
      if ($pipe.length) {
        $el.insertBefore($pipe);
      } 
      else {
        $el.appendTo($rightContainer);
      }
    };

    insertBeforePipe(this.$ccToggleButton); // 1
    insertBeforePipe($rightContainer.find('.able-button-handler-descriptions').first()); // 2
    insertBeforePipe($rightContainer.find('.able-button-handler-sign').first());         // 3
    insertBeforePipe($rightContainer.find('.able-button-handler-transcript').first());   // 4
    insertBeforePipe(this.$ccLanguageButton);                                            // 5
    insertBeforePipe($rightContainer.find('.able-button-handler-chapters').first());     // 6

    // Assegurar estat inicial coherent
    this.refreshControls('captions');
  };

  AblePlayer.prototype.handleCaptionToggle = function () {
    var captions = this.captions || [];

    if (this.hidingPopup) {
      this.hidingPopup = false;
      return false;
    }

    if (!captions.length) {
      if (typeof _origHandleCaptionToggle === 'function') {
        return _origHandleCaptionToggle.apply(this, arguments);
      }
      return;
    }

    if (this.captionsOn) {
      this.captionsOn = false;
      this.prefCaptions = 0;
      this.currentCaption = -1;
      this.updateCookie('prefCaptions');
      if (this.usingYouTubeCaptions && this.youTubePlayer) {
        this.youTubePlayer.unloadModule('captions');
      } 
       if (this.usingVimeoCaptions && this.vimeoPlayer) {
        this.vimeoPlayer.disableTextTrack();
      } 
      else if (this.$captionsWrapper) {
        this.$captionsWrapper.hide();
      }
      if (this.mediaType === 'audio' && this.$captionsContainer) {
        this.$captionsContainer.addClass('captions-off');
      }
      if (this.captionsPopup) {
        this.updateCaptionsMenu();
      }
    } 
    else {
      var track = getPreferredCaptionTrack(this);
      if (!track && typeof _origHandleCaptionToggle === 'function') {
        return _origHandleCaptionToggle.apply(this, arguments);
      }
      this.selectedCaptions = track;
      this.captionLang = track && track.language ? track.language : this.captionLang;
      this.captionsOn = true;
      this.prefCaptions = 1;
      this.updateCookie('prefCaptions');
      this.currentCaption = -1;

      if (this.usingYouTubeCaptions && this.youTubePlayer) {
        this.youTubePlayer.loadModule('captions');
        if (this.youTubePlayer.getOptions && this.youTubePlayer.getOptions('captions') && this.startedPlaying) {
          try {
            this.youTubePlayer.setOption('captions', 'track', { languageCode: this.captionLang });
          } catch (e) {
            this.captionLangPending = this.captionLang;
          }
        } 
        else {
          this.captionLangPending = this.captionLang;
        }
      } 
      else if (this.usingVimeoCaptions && this.vimeoPlayer) {
        this.vimeoPlayer.enableTextTrack(this.captionLang).catch(function () { });
      } 
      else {
        this.syncTrackLanguages('captions', this.captionLang);
        if (!this.swappingSrc) {
          this.updateCaption(this.elapsed);
          this.showDescription(this.elapsed);
        }
        if (this.$captionsWrapper) {
          this.$captionsWrapper.show();
        }
      }
      if (this.mediaType === 'audio' && this.$captionsContainer) {
        this.$captionsContainer.removeClass('captions-off');
      }
      if (this.captionsPopup) {
        this.updateCaptionsMenu(this.captionLang);
      }
    }

    this.refreshControls('captions');
  };

  AblePlayer.prototype.handleCaptionLanguage = function () {
    var thisObj = this;
    var hasSubs = this.captionsOn && this.captions && this.captions.length;
    var hasAD = this.descOn && ((this.descriptions && this.descriptions.length) || getOpenDescTrackFromCaptions(this));
    if (!hasSubs && !hasAD) return;

    var $menu = buildLanguageMenu(this);
    if (!$menu) return;

    if ($menu.is(':visible')) {
      $menu.hide();
      this.hidingPopup = false;
      this.$ccButton.attr('aria-expanded', 'false');
      this.waitThenFocus(this.$ccButton);
    } 
    else {
      this.closePopups();
      $menu.show();
      this.$ccButton.attr('aria-expanded', 'true');
      setTimeout(function () {
        var buttonPos = thisObj.$ccButton.position();
        var menuHeight = $menu.outerHeight();
        var menuWidth = $menu.outerWidth();
        var containerWidth = thisObj.$controllerDiv.width();
        var margin = 5;
        var left = buttonPos.left;

        if ((left + menuWidth) > (containerWidth - margin)) {
          left = Math.max(margin, containerWidth - margin - menuWidth);
        }

        $menu.css('top', buttonPos.top - menuHeight);
        $menu.css('left', left);
        focusLanguageMenuItem($menu, $menu.find('li[role="menuitemradio"]').first());
      }, 50);
    }
  };

  AblePlayer.prototype.onClickPlayerButton = function (el) {
    var whichButton = this.getButtonNameFromClass($(el).attr('class'));
    if (whichButton === 'captions-toggle') {
      this.handleCaptionToggle();
      return;
    }
    if (whichButton === 'captions') {
      this.handleCaptionLanguage();
      return;
    }
    return _onClick.apply(this, arguments);
  };

  // and refresh controls (buttons, status, etc.).
  AblePlayer.prototype.refreshControls = function (context, duration, elapsed) {
    _refresh.apply(this, arguments);

    if (this.$statusBarDiv && !this.fullscreen) {
      var statusBarWidthBreakpoint = 100;
      var $speed = this.$statusBarDiv.find('span.able-speed');
      if ($speed.length) {
        var statusBarHeight = this.$statusBarDiv.height();
        var speedHeight = $speed.height();
        if (speedHeight > (statusBarHeight + 5)) {
          $speed.hide();
          this.hidingSpeed = true;
        } 
        else {
          if (this.$statusBarDiv.width() < statusBarWidthBreakpoint) {
            $speed.hide();
            this.hidingSpeed = true;
          } 
          else {
            $speed.show();
            this.hidingSpeed = false;
          }
        }
      }
    }

    var hasCaptions = this.captions && this.captions.length;
    if (this.$ccToggleButton && hasCaptions) {
      this.toggleButtonState(
        this.$ccToggleButton,
        this.captionsOn,
        this.tt ? this.tt.hideCaptions : 'Amaga subtítols',
        this.tt ? this.tt.showCaptions : 'Mostra subtítols',
        false,
        false
      );
    }

    if (this.$ccButton) {

      var hasAD = (this.descriptions && this.descriptions.length) || hasOpenDescription(this);
      var showLangButton = (this.captionsOn && hasCaptions) || (this.descOn && hasAD);
      if (showLangButton) {
        var lowerFirst = function (str) {
          return (str && str.length) ? str.charAt(0).toLowerCase() + str.slice(1) : str;
        };
        var baseCaptionLabel = (this.tt && this.tt.captionsLanguage)
          ? lowerFirst(this.tt.captionsLanguage)
          : (this.tt && this.tt.captions) ? lowerFirst(this.tt.captions) : 'captions';
        var adLabel = (this.tt && this.tt.prefMenuDescriptions)
          ? lowerFirst(this.tt.prefMenuDescriptions)
          : (this.tt && this.tt.prefHeadingDescription) ? lowerFirst(this.tt.prefHeadingDescription) : 'ad';
        var langPrefix = (this.tt && this.tt.language) ? this.tt.language + ' ' : '';
        var captionsActive = this.captionsOn && hasCaptions;
        var adActive = this.descOn && hasAD;
        var langLabel;
        if (captionsActive && adActive) {
          langLabel = langPrefix + baseCaptionLabel + ' / ' + adLabel;
        } 
        else if (captionsActive) {
          langLabel = langPrefix + baseCaptionLabel;
        } 
        else if (adActive) {
          langLabel = langPrefix + adLabel;
        } 
        else {
          langLabel = langPrefix + baseCaptionLabel + ' / ' + adLabel;
        }
        this.$ccButton.show()
          .removeAttr('aria-pressed')
          .attr('aria-hidden', 'false')
          .attr('aria-label', langLabel)
          .attr({
            'aria-haspopup': 'true',
            'aria-expanded': (this.captionsPopup && this.captionsPopup.is(':visible')) ? 'true' : 'false',
            'aria-controls': this.mediaId + '-captions-menu'
          })
          .removeClass('buttonOff');
        this.$ccButton.find('span.able-clipped').text(langLabel);
      } 
      else {
        if (this.captionsPopup && this.captionsPopup.is(':visible')) {
          this.captionsPopup.hide();
        }
        this.$ccButton.hide()
          .removeAttr('aria-pressed')
          .attr('aria-hidden', 'true')
          .attr('aria-expanded', 'false')
          .addClass('buttonOff');
      }
    }
  };

  AblePlayer.prototype.updateCaptionsMenu = function (lang) {
    if (!this.captionsPopup) return;
    this.captionsPopup.find('li[data-kind="captions"]').attr('aria-checked', 'false');
    if (lang) {
      this.captionsPopup
        .find('li[data-kind="captions"][lang="' + lang + '"]')
        .attr('aria-checked', 'true');
    }
  };

})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
   Desacoblar idiomes de subtítols i AD (evitar sync automàtic)
═══════════════════════════════════════════════════════════════════════ */

(function ($) {
  if (!window.AblePlayer) return;

  AblePlayer.prototype.syncTrackLanguages = function (source, language) {
    var i, captions, descriptions, chapters, meta;

    for (i = 0; i < this.captions.length; i++) {
      if (this.captions[i].language === language) captions = this.captions[i];
    }
    for (i = 0; i < this.chapters.length; i++) {
      if (this.chapters[i].language === language) chapters = this.chapters[i];
    }
    for (i = 0; i < this.descriptions.length; i++) {
      if (this.descriptions[i].language === language) descriptions = this.descriptions[i];
    }
    for (i = 0; i < this.meta.length; i++) {
      if (this.meta[i].language === language) meta = this.meta[i];
    }

    this.transcriptLang = language;

    if (source === 'init' || source === 'captions') {
      this.captionLang = language;
      this.selectedCaptions = captions || this.selectedCaptions;
      this.selectedChapters = chapters || this.selectedChapters;
      this.selectedMeta = meta || this.selectedMeta;
      this.transcriptCaptions = captions || this.transcriptCaptions;
      this.transcriptChapters = chapters || this.transcriptChapters;
      this.transcriptDescriptions = descriptions || this.transcriptDescriptions;

      if (source === 'init' && !this.selectedDescriptions && this.descriptions.length) {
        var defaultDesc = descriptions ||
          this.descriptions.find(function (d) { return d.def; }) ||
          this.descriptions[0];
        this.selectedDescriptions = defaultDesc;
      }

      this.updateChaptersList();
    } 
    else if (source === 'transcript') {
      this.transcriptCaptions = captions || this.transcriptCaptions;
      this.transcriptChapters = chapters || this.transcriptChapters;
      this.transcriptDescriptions = descriptions || this.transcriptDescriptions;
    }

    if (this.selectedDescriptions && source === 'init') {
      this.setDescriptionVoice();
    }
    this.updateTranscript();
  };
})(jQuery);

/* ══════════════════════════════════════════════════════════════════════
   Veu sintètica d’AD en l’idioma de la pista d’AD (no del web/CC)
═══════════════════════════════════════════════════════════════════════ */

(function ($) {
  if (!window.AblePlayer) return;

  AblePlayer.prototype.getBrowserVoices = function () {
    var voices, descLangs, voiceLang, preferredLang;

    preferredLang = (this.selectedDescriptions && this.selectedDescriptions.language)
      ? this.selectedDescriptions.language
      : (this.captionLang || this.lang);
    preferredLang = preferredLang.substring(0, 2).toLowerCase();

    this.descVoices = [];
    if (!this.synth) return false;

    voices = this.synth.getVoices();
    descLangs = this.getDescriptionLangs();
    if (voices.length > 0) {
      this.descVoices = [];
      for (var i = 0; i < voices.length; i++) {
        voiceLang = voices[i].lang.substring(0, 2).toLowerCase();
        if (voiceLang === preferredLang && descLangs.indexOf(voiceLang) !== -1) {
          this.descVoices.push(voices[i]);
        }
      }
      if (!this.descVoices.length) {
        this.descVoices = voices;
      }
    }
    return false;
  };

  var _origAnnounceDesc = AblePlayer.prototype.announceDescriptionText;
  AblePlayer.prototype.announceDescriptionText = function () {
    var originalLang = this.lang;
    var descLang = (this.selectedDescriptions && this.selectedDescriptions.language) ||
      this.captionLang || this.lang;
    this.lang = descLang;
    _origAnnounceDesc.apply(this, arguments);
    this.lang = originalLang;
  };
})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════
   YouTube captions: Timeout de 500ms per resoldre la promesa i evitar que el
   player perdi controls quan YouTube no retorna pistes de captions   
══════════════════════════════════════════════════════════════════════════════ */

(function ($) {
  if (!window.AblePlayer || !AblePlayer.prototype.getYouTubeCaptionTracks) return;

  var origGetYouTubeCaptionTracks = AblePlayer.prototype.getYouTubeCaptionTracks;

  AblePlayer.prototype.getYouTubeCaptionTracks = function () {
    var thisObj = this;
    var originalPromise = origGetYouTubeCaptionTracks.apply(this, arguments);

    // Envoltem amb un timeout perquè la promesa es resolgui sempre
    var timeoutMs = 500;
    var d = $.Deferred();
    if (!thisObj.okToPlay && thisObj.youTubePlayer && typeof thisObj.youTubePlayer.pauseVideo === 'function') {
      setTimeout(function () {
        if (thisObj.loadingYouTubeCaptions) {
          thisObj.youTubePlayer.pauseVideo(); // Seguretat addicional: atura ràpid si segueix carregant
        }
      }, 200);
    }
    var timer = setTimeout(function () {
      // Si no hi ha captions, forcem valors segurs perquè el player continuï
      thisObj.youtubeCaptions = thisObj.youtubeCaptions || [];
      thisObj.usingYouTubeCaptions = !!(thisObj.youtubeCaptions.length);
      thisObj.hasCaptions = thisObj.usingYouTubeCaptions;
      thisObj.loadingYouTubeCaptions = false;
      if (!thisObj.okToPlay && thisObj.youTubePlayer && typeof thisObj.youTubePlayer.pauseVideo === 'function') {
        thisObj.youTubePlayer.pauseVideo(); // Evita reproducció automàtica si YouTube no retorna pistes
      }
      d.resolve(thisObj.youtubeCaptions);
    }, timeoutMs);

    originalPromise.then(function (res) {
      clearTimeout(timer);
      d.resolve(res);
    }).fail(function () {
      clearTimeout(timer);
      thisObj.youtubeCaptions = thisObj.youtubeCaptions || [];
      thisObj.usingYouTubeCaptions = !!(thisObj.youtubeCaptions.length);
      thisObj.hasCaptions = thisObj.usingYouTubeCaptions;
      thisObj.loadingYouTubeCaptions = false;
      if (!thisObj.okToPlay && thisObj.youTubePlayer && typeof thisObj.youTubePlayer.pauseVideo === 'function') {
        thisObj.youTubePlayer.pauseVideo();
      }
      d.resolve(thisObj.youtubeCaptions);
    });

    return d.promise();
  };
})(jQuery);

/* ═══════════════════════════════════════════════════════════════════════════
   ARIA-LABEL DEL ROLE="REGION" DEL REPRODUCTOR, TANT EN ÀUDIO COM EN VÍDEO
══════════════════════════════════════════════════════════════════════════════ */

(function patchPlayerRegionAriaLabel() {
  function getPlayerRegionLabel(playerInstance) {
    var tt = playerInstance.tt || {};
    var mediaType = (playerInstance.mediaType || 'media').toString().toLowerCase();
    var mediaLabel = tt[mediaType] || mediaType;
    var playerHeading = tt.playerHeading || 'player';

    if (playerHeading && mediaLabel) {
      return playerHeading + ' ' + mediaLabel;
    }
    return playerHeading || mediaLabel || 'player';
  }

  function applyPatch() {
    if (!window.AblePlayer || !AblePlayer.prototype || !AblePlayer.prototype.injectPlayerControlArea) {
      return false;
    }
    if (AblePlayer.prototype.__twPlayerRegionAriaLabelPatched) {
      return true;
    }

    var originalInjectPlayerControlArea = AblePlayer.prototype.injectPlayerControlArea;

    AblePlayer.prototype.injectPlayerControlArea = function () {
      originalInjectPlayerControlArea.apply(this, arguments);

      if (this.$playerDiv && this.$playerDiv.length) {
        this.$playerDiv.attr('aria-label', getPlayerRegionLabel(this));
      }
    };

    AblePlayer.prototype.__twPlayerRegionAriaLabelPatched = true;
    return true;
  }

  if (applyPatch()) return;

  var onReady = function () { applyPatch(); };
  if (document.readyState === 'complete') onReady();
  else window.addEventListener('load', onReady);
})();
