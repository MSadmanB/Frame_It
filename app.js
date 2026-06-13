/**
 * Frameit — Application Logic
 * Implements interactive canvas, image manipulations, presets, and chroma-key merging.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const canvas = document.getElementById('studio-canvas');
  const ctx = canvas.getContext('2d');
  const canvasContainer = document.querySelector('.canvas-container');
  const canvasLoader = document.getElementById('canvas-loader');
  
  // Tab Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // File Inputs & Dropzones
  const photoInput = document.getElementById('input-photo');
  const photoDropzone = document.getElementById('photo-dropzone');
  const photoDropzonePreview = document.getElementById('photo-dropzone-preview');
  
  const frameInput = document.getElementById('input-frame');
  const frameDropzone = document.getElementById('frame-dropzone');
  const frameDropzonePreview = document.getElementById('frame-dropzone-preview');
  const btnClearCustomFrame = document.getElementById('btn-clear-custom-frame');

  // Custom Frame Chroma Key Panel Elements
  const customFrameKeyingPanel = document.getElementById('custom-frame-keying-panel');
  const selectCustomKeyingMode = document.getElementById('custom-keying-mode');
  const customKeyingColorWrapper = document.getElementById('custom-keying-color-wrapper');
  const inputCustomKeyingColor = document.getElementById('custom-keying-color');
  const inputCustomKeyingTolerance = document.getElementById('custom-keying-tolerance');
  const valCustomKeyingTolerance = document.getElementById('val-custom-keying-tolerance');
  const inputCustomKeyingSmooth = document.getElementById('custom-keying-smooth');
  const valCustomKeyingSmooth = document.getElementById('val-custom-keying-smooth');
  
  // Presets
  const presetCards = document.querySelectorAll('.preset-card');
  const frameCustomizer = document.getElementById('frame-customizer');
  const frameSubSettings = document.querySelectorAll('.frame-sub-settings');
  
  // Polaroid Customizer
  const inputPolaroidText = document.getElementById('polaroid-text');
  const selectPolaroidFont = document.getElementById('polaroid-font');
  
  // Cyber Glow Customizer
  const inputNeonColor1 = document.getElementById('neon-color-1');
  const inputNeonColor2 = document.getElementById('neon-color-2');
  
  // Gallery Matting Customizer
  const inputGalleryColor = document.getElementById('gallery-mat-color');
  const inputGallerySize = document.getElementById('gallery-size');
  const valGallerySize = document.getElementById('val-gallery-size');

  // Procedural Border Customizer
  const inputBorderColor = document.getElementById('border-color');
  const inputBorderWidth = document.getElementById('border-width');
  const valBorderWidth = document.getElementById('val-border-width');
  const inputBorderRadius = document.getElementById('border-radius');
  const valBorderRadius = document.getElementById('val-border-radius');
  const inputBorderShadow = document.getElementById('border-shadow');
  
  // Keying Customizer (for images with white backgrounds)
  const inputKeyingThresh = document.getElementById('keying-thresh');
  const valKeyingThresh = document.getElementById('val-keying-thresh');
  
  // Photo Transform Sliders
  const sliderScale = document.getElementById('photo-scale');
  const valScale = document.getElementById('val-photo-scale');
  const sliderRotate = document.getElementById('photo-rotate');
  const valRotate = document.getElementById('val-photo-rotate');
  const sliderX = document.getElementById('photo-x');
  const valX = document.getElementById('val-photo-x');
  const sliderY = document.getElementById('photo-y');
  const valY = document.getElementById('val-photo-y');
  
  // Filters Sliders
  const sliderBrightness = document.getElementById('filter-brightness');
  const valBrightness = document.getElementById('val-filter-brightness');
  const sliderContrast = document.getElementById('filter-contrast');
  const valContrast = document.getElementById('val-filter-contrast');
  const sliderSaturation = document.getElementById('filter-saturation');
  const valSaturation = document.getElementById('val-filter-saturation');
  const sliderBlur = document.getElementById('filter-blur');
  const valBlur = document.getElementById('val-filter-blur');
  const sliderGrayscale = document.getElementById('filter-grayscale');
  const valGrayscale = document.getElementById('val-filter-grayscale');
  const sliderSepia = document.getElementById('filter-sepia');
  const valSepia = document.getElementById('val-filter-sepia');
  const sliderHue = document.getElementById('filter-hue');
  const valHue = document.getElementById('val-filter-hue');
  
  // Action Buttons
  const btnResetAll = document.getElementById('btn-reset-all');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnFitPhoto = document.getElementById('btn-fit-photo');
  const btnFillPhoto = document.getElementById('btn-fill-photo');
  const btnCenterPhoto = document.getElementById('btn-center-photo');
  const btnRotate90 = document.getElementById('btn-rotate-90');
  
  // Toolbar Buttons
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const txtCanvasZoom = document.getElementById('txt-canvas-zoom');
  const btnRotateLeft = document.getElementById('btn-rotate-left');
  const btnRotateRight = document.getElementById('btn-rotate-right');
  const btnResetTransform = document.getElementById('btn-reset-transform');
  
  // Export Elements
  const selectExportFormat = document.getElementById('export-format');
  const jpegQualityWrapper = document.getElementById('jpeg-quality-wrapper');
  const sliderExportQuality = document.getElementById('export-quality');
  const valExportQuality = document.getElementById('val-export-quality');
  const txtOutputDims = document.getElementById('txt-output-dims');
  const btnDownload = document.getElementById('btn-download');
  
  // Toast
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- App State ---
  const state = {
    photo: {
      image: null,
      loaded: false,
      name: 'photo.jpg',
      width: 0,
      height: 0
    },
    customFrame: {
      image: null,
      loaded: false,
      name: '',
      processedCanvas: null,
      keying: {
        mode: 'none', // none, white, black, color
        color: '#ffffff',
        tolerance: 60,
        smoothing: 15
      }
    },
    // Active Preset (none, polaroid, wood, gold, neon, gallery, custom-border, custom-frame-overlay)
    preset: 'gallery', 
    
    // Transformations
    transform: {
      scale: 1.0,
      rotate: 0, // degrees
      x: 0, // offsets
      y: 0
    },
    
    // Photo filters
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hue: 0
    },
    
    // Specific frame presets configurations
    frameCustom: {
      polaroid: {
        text: 'Summer Vibes 2026',
        font: "'Courier New', Courier, monospace"
      },
      neon: {
        color1: '#8b5cf6',
        color2: '#06b6d4'
      },
      gallery: {
        color: '#f8fafc',
        size: 12 // percentage padding
      },
      border: {
        color: '#ffffff',
        width: 40,
        radius: 8,
        shadow: true
      },
      // Settings for image presets keying (Gold, Wood)
      keying: {
        threshold: 60 // Default keying for presets (keys out white center)
      }
    },
    
    // Canvas Display Size
    canvasSize: {
      width: 1200,
      height: 1200
    },
    
    // Interactive dragging
    drag: {
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    }
  };

  // Preloaded Presets cache
  const presetImages = {
    gold: { url: 'assets/presets/gold-frame.png', img: null, processedCanvas: null, loaded: false },
    wood: { url: 'assets/presets/wood-frame.png', img: null, processedCanvas: null, loaded: false }
  };

  // --- Initialize App ---
  function init() {
    loadPreloadedPresets();
    loadSamplePhoto();
    setupEventListeners();
    setActiveTab('tab-upload');
    updatePresetUI();
    showToast('Frameit Studio Loaded!');
  }

  // --- Load Initial Assets (No crossOrigin for same-origin local files) ---
  function loadSamplePhoto() {
    showLoader(true);
    const img = new Image();
    img.onload = () => {
      state.photo.image = img;
      state.photo.loaded = true;
      state.photo.width = img.naturalWidth;
      state.photo.height = img.naturalHeight;
      state.photo.name = 'sample-photo.png';
      
      // Update dropzone background
      photoDropzonePreview.style.backgroundImage = `url(${img.src})`;
      photoDropzonePreview.classList.add('has-image');
      
      // Center and fit photo inside canvas on start
      resetTransformations(true);
      updateOutputDimensions();
      showLoader(false);
      render();
    };
    img.onerror = () => {
      console.error('Failed to load sample photo');
      showLoader(false);
      showToast('Error loading sample photo.', 'danger');
    };
    img.src = 'assets/sample-photo.png';
  }

  function loadPreloadedPresets() {
    Object.keys(presetImages).forEach(key => {
      const item = presetImages[key];
      const img = new Image();
      img.onload = () => {
        item.img = img;
        item.loaded = true;
        
        // If the active preset matches, re-render immediately
        if (state.preset === key) {
          processFrameImage(key);
          render();
        }
      };
      img.onerror = () => console.error(`Error loading preset image: ${key}`);
      img.src = item.url;
    });
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });

    // File Uploads
    photoInput.addEventListener('change', (e) => handlePhotoUpload(e.target.files[0]));
    frameInput.addEventListener('change', (e) => handleFrameUpload(e.target.files[0]));

    // Drag and drop events
    setupDragAndDrop(photoDropzone, handlePhotoUpload);
    setupDragAndDrop(frameDropzone, handleFrameUpload);

    btnClearCustomFrame.addEventListener('click', removeCustomFrame);

    // Custom Chroma Key Panel Events
    selectCustomKeyingMode.addEventListener('change', (e) => {
      state.customFrame.keying.mode = e.target.value;
      if (e.target.value === 'color') {
        customKeyingColorWrapper.classList.remove('hidden');
      } else {
        customKeyingColorWrapper.classList.add('hidden');
      }
      processCustomFrameImage();
      render();
    });

    inputCustomKeyingColor.addEventListener('input', (e) => {
      state.customFrame.keying.color = e.target.value;
      processCustomFrameImage();
      render();
    });

    inputCustomKeyingTolerance.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.customFrame.keying.tolerance = val;
      valCustomKeyingTolerance.textContent = val;
      processCustomFrameImage();
      render();
    });

    inputCustomKeyingSmooth.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.customFrame.keying.smoothing = val;
      valCustomKeyingSmooth.textContent = val;
      processCustomFrameImage();
      render();
    });

    // Preset Selection
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        presetCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.preset = card.dataset.preset;
        updatePresetUI();
        render();
      });
    });

    // Sliders & Customizer inputs
    // Polaroid
    inputPolaroidText.addEventListener('input', (e) => {
      state.frameCustom.polaroid.text = e.target.value;
      render();
    });
    selectPolaroidFont.addEventListener('change', (e) => {
      state.frameCustom.polaroid.font = e.target.value;
      render();
    });

    // Neon colors
    inputNeonColor1.addEventListener('input', (e) => {
      state.frameCustom.neon.color1 = e.target.value;
      render();
    });
    inputNeonColor2.addEventListener('input', (e) => {
      state.frameCustom.neon.color2 = e.target.value;
      render();
    });

    // Gallery Matting
    inputGalleryColor.addEventListener('input', (e) => {
      state.frameCustom.gallery.color = e.target.value;
      render();
    });
    inputGallerySize.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.frameCustom.gallery.size = val;
      valGallerySize.textContent = `${val}%`;
      render();
    });

    // Procedural Border
    inputBorderColor.addEventListener('input', (e) => {
      state.frameCustom.border.color = e.target.value;
      render();
    });
    inputBorderWidth.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.frameCustom.border.width = val;
      valBorderWidth.textContent = `${val}px`;
      render();
    });
    inputBorderRadius.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.frameCustom.border.radius = val;
      valBorderRadius.textContent = `${val}px`;
      render();
    });
    inputBorderShadow.addEventListener('change', (e) => {
      state.frameCustom.border.shadow = e.target.checked;
      render();
    });

    // Presets Keying threshold (For Gold/Wood preset frames)
    inputKeyingThresh.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.frameCustom.keying.threshold = val;
      valKeyingThresh.textContent = val;
      
      if (state.preset === 'gold' || state.preset === 'wood') {
        processFrameImage(state.preset);
      }
      render();
    });

    // Photo Transformations Sliders
    sliderScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.transform.scale = val;
      valScale.textContent = `${val.toFixed(2)}x`;
      txtCanvasZoom.textContent = `${Math.round(val * 100)}%`;
      render();
    });
    sliderRotate.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.transform.rotate = val;
      valRotate.textContent = `${val}°`;
      render();
    });
    sliderX.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.transform.x = val;
      valX.textContent = `${val}px`;
      render();
    });
    sliderY.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.transform.y = val;
      valY.textContent = `${val}px`;
      render();
    });

    // Filters sliders
    bindFilterSlider(sliderBrightness, 'brightness', valBrightness, '%');
    bindFilterSlider(sliderContrast, 'contrast', valContrast, '%');
    bindFilterSlider(sliderSaturation, 'saturation', valSaturation, '%');
    bindFilterSlider(sliderBlur, 'blur', valBlur, 'px');
    bindFilterSlider(sliderGrayscale, 'grayscale', valGrayscale, '%');
    bindFilterSlider(sliderSepia, 'sepia', valSepia, '%');
    bindFilterSlider(sliderHue, 'hue', valHue, '°');

    // Quick Action button handlers
    btnResetAll.addEventListener('click', resetAllSettings);
    btnResetFilters.addEventListener('click', resetFilters);
    btnFitPhoto.addEventListener('click', () => { fitPhoto(true); render(); });
    btnFillPhoto.addEventListener('click', () => { fitPhoto(false); render(); });
    btnCenterPhoto.addEventListener('click', () => {
      state.transform.x = 0;
      state.transform.y = 0;
      updateTransformSliders();
      render();
    });
    btnRotate90.addEventListener('click', () => {
      state.transform.rotate = (state.transform.rotate + 90) % 360;
      if (state.transform.rotate > 180) state.transform.rotate -= 360;
      updateTransformSliders();
      render();
    });

    // Toolbar elements
    btnZoomIn.addEventListener('click', () => {
      state.transform.scale = Math.min(3.0, state.transform.scale + 0.1);
      updateTransformSliders();
      render();
    });
    btnZoomOut.addEventListener('click', () => {
      state.transform.scale = Math.max(0.1, state.transform.scale - 0.1);
      updateTransformSliders();
      render();
    });
    btnRotateLeft.addEventListener('click', () => {
      state.transform.rotate = (state.transform.rotate - 15);
      if (state.transform.rotate < -180) state.transform.rotate += 360;
      updateTransformSliders();
      render();
    });
    btnRotateRight.addEventListener('click', () => {
      state.transform.rotate = (state.transform.rotate + 15);
      if (state.transform.rotate > 180) state.transform.rotate -= 360;
      updateTransformSliders();
      render();
    });
    btnResetTransform.addEventListener('click', () => {
      resetTransformations(true);
      render();
    });

    // Canvas Mouse Interaction for Dragging (Panning)
    canvas.addEventListener('mousedown', dragStart);
    canvas.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    // Canvas Touch Interaction
    canvas.addEventListener('touchstart', dragStart, { passive: false });
    canvas.addEventListener('touchmove', dragMove, { passive: false });
    canvas.addEventListener('touchend', dragEnd);

    // Canvas Zooming via Wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 0.05;
      if (e.deltaY < 0) {
        state.transform.scale = Math.min(3.0, state.transform.scale + zoomFactor);
      } else {
        state.transform.scale = Math.max(0.1, state.transform.scale - zoomFactor);
      }
      updateTransformSliders();
      render();
    }, { passive: false });

    // Double click to center
    canvas.addEventListener('dblclick', () => {
      state.transform.x = 0;
      state.transform.y = 0;
      updateTransformSliders();
      render();
    });

    // Export Format & download
    selectExportFormat.addEventListener('change', (e) => {
      if (e.target.value === 'image/jpeg') {
        jpegQualityWrapper.classList.remove('hidden');
      } else {
        jpegQualityWrapper.classList.add('hidden');
      }
    });
    sliderExportQuality.addEventListener('input', (e) => {
      valExportQuality.textContent = `${e.target.value}%`;
    });
    btnDownload.addEventListener('click', downloadFramedPhoto);
  }

  // Bind individual filter range inputs
  function bindFilterSlider(slider, key, displayLabel, unit) {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.filters[key] = val;
      displayLabel.textContent = `${val}${unit}`;
      render();
    });
  }

  // Set Active Sidebar Tab
  function setActiveTab(tabId) {
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  // --- File Upload Logic ---
  function setupDragAndDrop(dropzone, fileHandler) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        fileHandler(files[0]);
      }
    }, false);
  }

  function handlePhotoUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'danger');
      return;
    }
    showLoader(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.photo.image = img;
        state.photo.loaded = true;
        state.photo.width = img.naturalWidth;
        state.photo.height = img.naturalHeight;
        state.photo.name = file.name;
        
        photoDropzonePreview.style.backgroundImage = `url(${e.target.result})`;
        photoDropzonePreview.classList.add('has-image');
        
        // Auto fit photo
        fitPhoto(true);
        updateOutputDimensions();
        showLoader(false);
        showToast('Photo uploaded successfully!');
        render();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleFrameUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid frame image file', 'danger');
      return;
    }
    showLoader(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.customFrame.image = img;
        state.customFrame.loaded = true;
        state.customFrame.name = file.name;
        
        frameDropzonePreview.style.backgroundImage = `url(${e.target.result})`;
        frameDropzonePreview.classList.add('has-image');
        
        btnClearCustomFrame.classList.remove('hidden');
        customFrameKeyingPanel.classList.remove('hidden');

        // Automatically configure chroma key selector to auto key out white if it's not a transparent PNG
        // Standard user uploads with solid backgrounds are usually white.
        state.customFrame.keying.mode = 'white';
        selectCustomKeyingMode.value = 'white';
        
        // Apply keying
        processCustomFrameImage();
        
        // Make custom frame the active preset
        state.preset = 'custom-frame-overlay';
        
        // Unselect preset card UI
        presetCards.forEach(c => c.classList.remove('active'));
        
        updatePresetUI();
        showLoader(false);
        showToast('Custom frame loaded! Auto-keyed white background.');
        render();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removeCustomFrame() {
    state.customFrame.image = null;
    state.customFrame.loaded = false;
    state.customFrame.name = '';
    state.customFrame.processedCanvas = null;
    
    frameDropzonePreview.style.backgroundImage = 'none';
    frameDropzonePreview.classList.remove('has-image');
    btnClearCustomFrame.classList.add('hidden');
    customFrameKeyingPanel.classList.add('hidden');
    frameInput.value = '';

    if (state.preset === 'custom-frame-overlay') {
      state.preset = 'none';
      presetCards.forEach(c => {
        if (c.dataset.preset === 'none') c.classList.add('active');
      });
    }

    updatePresetUI();
    showToast('Custom frame removed');
    render();
  }

  // --- Chroma Key Background Removal System ---
  function applyChromaKey(img, mode, customColorHex, tolerance, smoothing) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    
    if (mode === 'none') {
      return tempCanvas;
    }
    
    // Parse key color RGB
    let kr = 255, kg = 255, kb = 255; // Default white
    if (mode === 'black') {
      kr = 0; kg = 0; kb = 0;
    } else if (mode === 'color' && customColorHex) {
      const hex = customColorHex.replace('#', '');
      kr = parseInt(hex.substring(0, 2), 16);
      kg = parseInt(hex.substring(2, 4), 16);
      kb = parseInt(hex.substring(4, 6), 16);
    }
    
    try {
      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        if (a === 0) continue; // Skip already transparent pixels
        
        // Calculate Euclidean distance in color space
        const diffR = r - kr;
        const diffG = g - kg;
        const diffB = b - kb;
        const distance = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);
        
        // Thresholding and edge smoothing
        if (distance < tolerance) {
          data[i+3] = 0; // Cut out
        } else if (distance < tolerance + smoothing) {
          // Smooth boundary anti-aliasing
          const factor = (distance - tolerance) / smoothing;
          data[i+3] = Math.round(a * factor);
        }
      }
      
      tempCtx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel manipulation error (CORS/Security):', e);
    }
    return tempCanvas;
  }

  // Preset frames keying (uses simple thresholding on white)
  function processFrameImage(presetKey) {
    const item = presetImages[presetKey];
    if (!item || !item.loaded) return;
    
    // Simple white keying for preset frame graphics
    item.processedCanvas = applyChromaKey(item.img, 'white', '#ffffff', state.frameCustom.keying.threshold, 20);
  }

  // Custom frame keying (uses advanced tolerance and color pickers)
  function processCustomFrameImage() {
    if (!state.customFrame.loaded) return;
    
    const k = state.customFrame.keying;
    state.customFrame.processedCanvas = applyChromaKey(
      state.customFrame.image,
      k.mode,
      k.color,
      k.tolerance,
      k.smoothing
    );
  }

  // --- Preset Panel UI Updates ---
  function updatePresetUI() {
    // Hide all frame customizers
    frameSubSettings.forEach(panel => panel.classList.add('hidden'));
    frameCustomizer.classList.add('hidden');
    
    const p = state.preset;
    
    if (p === 'polaroid') {
      frameCustomizer.classList.remove('hidden');
      document.getElementById('settings-polaroid').classList.remove('hidden');
    } else if (p === 'neon') {
      frameCustomizer.classList.remove('hidden');
      document.getElementById('settings-neon').classList.remove('hidden');
    } else if (p === 'gallery') {
      frameCustomizer.classList.remove('hidden');
      document.getElementById('settings-gallery').classList.remove('hidden');
    } else if (p === 'custom-border') {
      frameCustomizer.classList.remove('hidden');
      document.getElementById('settings-border').classList.remove('hidden');
    } else if (p === 'gold' || p === 'wood') {
      frameCustomizer.classList.remove('hidden');
      document.getElementById('settings-keying').classList.remove('hidden');
      
      // Select preset threshold
      inputKeyingThresh.value = state.frameCustom.keying.threshold;
      valKeyingThresh.textContent = state.frameCustom.keying.threshold;
      
      if (p === 'gold' && presetImages.gold.loaded && !presetImages.gold.processedCanvas) {
        processFrameImage('gold');
      }
      if (p === 'wood' && presetImages.wood.loaded && !presetImages.wood.processedCanvas) {
        processFrameImage('wood');
      }
    }
    
    // Toggle contextual custom chroma key panel in uploads tab
    if (state.customFrame.loaded && p === 'custom-frame-overlay') {
      customFrameKeyingPanel.classList.remove('hidden');
    } else {
      customFrameKeyingPanel.classList.add('hidden');
    }
    
    updateOutputDimensions();
  }

  // --- Reset Commands ---
  function resetTransformations(fit = true) {
    state.transform.x = 0;
    state.transform.y = 0;
    state.transform.rotate = 0;
    state.transform.scale = 1.0;
    
    if (fit && state.photo.loaded) {
      fitPhoto(true);
    }
    
    updateTransformSliders();
  }

  function fitPhoto(fitInside = true) {
    if (!state.photo.loaded) return;
    
    const frameSize = getFrameInnerDimensions();
    
    const pW = state.photo.width;
    const pH = state.photo.height;
    const fW = frameSize.width;
    const fH = frameSize.height;
    
    const ratioPhoto = pW / pH;
    const ratioFrame = fW / fH;
    
    let scale = 1.0;
    if (fitInside) {
      scale = (ratioPhoto > ratioFrame) ? (fW / pW) : (fH / pH);
    } else {
      scale = (ratioPhoto > ratioFrame) ? (fH / pH) : (fW / pW);
    }
    
    state.transform.scale = parseFloat(scale.toFixed(4));
    state.transform.x = 0;
    state.transform.y = 0;
    
    updateTransformSliders();
  }

  function getFrameInnerDimensions() {
    const cw = state.canvasSize.width;
    const ch = state.canvasSize.height;
    
    switch (state.preset) {
      case 'polaroid':
        const side = cw - 120;
        return { width: side, height: side };
      case 'gallery':
        const matPadding = (state.frameCustom.gallery.size / 100) * cw;
        return { width: cw - (matPadding * 2), height: ch - (matPadding * 2) };
      case 'custom-border':
        const borderWidth = state.frameCustom.border.width;
        return { width: cw - (borderWidth * 2), height: ch - (borderWidth * 2) };
      case 'neon':
        return { width: cw - 60, height: ch - 60 };
      case 'gold':
      case 'wood':
        return { width: cw * 0.78, height: ch * 0.78 };
      default:
        return { width: cw, height: ch };
    }
  }

  function updateTransformSliders() {
    sliderScale.value = state.transform.scale;
    valScale.textContent = `${state.transform.scale.toFixed(2)}x`;
    txtCanvasZoom.textContent = `${Math.round(state.transform.scale * 100)}%`;
    
    sliderRotate.value = state.transform.rotate;
    valRotate.textContent = `${state.transform.rotate}°`;
    
    sliderX.value = state.transform.x;
    valX.textContent = `${state.transform.x}px`;
    
    sliderY.value = state.transform.y;
    valY.textContent = `${state.transform.y}px`;
  }

  function resetFilters() {
    state.filters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hue: 0
    };
    
    sliderBrightness.value = 100; valBrightness.textContent = '100%';
    sliderContrast.value = 100; valContrast.textContent = '100%';
    sliderSaturation.value = 100; valSaturation.textContent = '100%';
    sliderBlur.value = 0; valBlur.textContent = '0px';
    sliderGrayscale.value = 0; valGrayscale.textContent = '0%';
    sliderSepia.value = 0; valSepia.textContent = '0%';
    sliderHue.value = 0; valHue.textContent = '0°';
    
    showToast('Filters reset');
    render();
  }

  function resetAllSettings() {
    resetTransformations(true);
    resetFilters();
    state.preset = 'gallery';
    
    // Reset inputs
    inputPolaroidText.value = 'Summer Vibes 2026';
    state.frameCustom.polaroid.text = 'Summer Vibes 2026';
    
    inputGallerySize.value = 12;
    state.frameCustom.gallery.size = 12;
    valGallerySize.textContent = '12%';
    
    inputBorderWidth.value = 40;
    state.frameCustom.border.width = 40;
    valBorderWidth.textContent = '40px';
    
    inputBorderRadius.value = 8;
    state.frameCustom.border.radius = 8;
    valBorderRadius.textContent = '8px';
    
    state.frameCustom.keying.threshold = 60;
    
    presetCards.forEach(c => {
      c.classList.remove('active');
      if (c.dataset.preset === 'gallery') c.classList.add('active');
    });
    
    removeCustomFrame();
    updatePresetUI();
    showToast('Studio settings reset');
    render();
  }

  // --- Output Resolution Computations ---
  function updateOutputDimensions() {
    let outW = 1200;
    let outH = 1200;

    if (state.photo.loaded) {
      const pRatio = state.photo.width / state.photo.height;
      
      switch (state.preset) {
        case 'polaroid':
          outW = 1000;
          outH = 1250;
          break;
        case 'gallery':
        case 'custom-border':
        case 'neon':
        case 'none':
          if (pRatio >= 1) {
            outW = Math.max(1200, state.photo.width);
            outH = Math.round(outW / pRatio);
          } else {
            outH = Math.max(1200, state.photo.height);
            outW = Math.round(outH * pRatio);
          }
          break;
        case 'gold':
        case 'wood':
          outW = 1200;
          outH = 1200;
          break;
        case 'custom-frame-overlay':
          if (state.customFrame.loaded) {
            outW = state.customFrame.image.naturalWidth;
            outH = state.customFrame.image.naturalHeight;
          }
          break;
      }
    }

    state.canvasSize.width = outW;
    state.canvasSize.height = outH;
    txtOutputDims.textContent = `${outW} × ${outH} px`;
  }

  // --- Mouse / Touch Interactive Drag-to-Pan Handlers ---
  function dragStart(e) {
    if (!state.photo.loaded) return;
    
    state.drag.isDragging = true;
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    state.drag.startX = clientX;
    state.drag.startY = clientY;
    
    state.drag.offsetX = state.transform.x;
    state.drag.offsetY = state.transform.y;
  }

  function dragMove(e) {
    if (!state.drag.isDragging) return;
    e.preventDefault();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = clientX - state.drag.startX;
    const dy = clientY - state.drag.startY;
    
    const rect = canvas.getBoundingClientRect();
    const scaleFactorX = state.canvasSize.width / rect.width;
    const scaleFactorY = state.canvasSize.height / rect.height;
    
    state.transform.x = Math.round(state.drag.offsetX + (dx * scaleFactorX));
    state.transform.y = Math.round(state.drag.offsetY + (dy * scaleFactorY));
    
    sliderX.value = Math.max(-400, Math.min(400, state.transform.x));
    valX.textContent = `${state.transform.x}px`;
    
    sliderY.value = Math.max(-400, Math.min(400, state.transform.y));
    valY.textContent = `${state.transform.y}px`;
    
    render();
  }

  function dragEnd() {
    state.drag.isDragging = false;
  }

  // --- Drawing Pipeline (Core Engine) ---
  function render() {
    if (canvas.width !== state.canvasSize.width || canvas.height !== state.canvasSize.height) {
      canvas.width = state.canvasSize.width;
      canvas.height = state.canvasSize.height;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    
    ctx.clearRect(0, 0, cw, ch);
    
    drawCanvasBackground();

    // 2. Draw user photo
    if (state.photo.loaded) {
      ctx.save();
      
      applyPhotoClipping(ctx, cw, ch);
      
      ctx.translate(cw / 2 + state.transform.x, ch / 2 + state.transform.y);
      ctx.rotate((state.transform.rotate * Math.PI) / 180);
      ctx.scale(state.transform.scale, state.transform.scale);
      
      applyFilters(ctx);
      
      ctx.drawImage(
        state.photo.image,
        -state.photo.width / 2,
        -state.photo.height / 2,
        state.photo.width,
        state.photo.height
      );
      
      ctx.restore();
    }

    // 3. Draw frame layer on top of photo
    drawFrameOverlay(cw, ch);
  }

  function drawCanvasBackground() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function applyFilters(context) {
    const f = state.filters;
    let filterString = `brightness(${f.brightness}%) `;
    filterString += `contrast(${f.contrast}%) `;
    filterString += `saturate(${f.saturation}%) `;
    
    if (f.blur > 0) filterString += `blur(${f.blur}px) `;
    if (f.grayscale > 0) filterString += `grayscale(${f.grayscale}%) `;
    if (f.sepia > 0) filterString += `sepia(${f.sepia}%) `;
    if (f.hue > 0) filterString += `hue-rotate(${f.hue}deg) `;
    
    context.filter = filterString.trim();
  }

  function applyPhotoClipping(context, cw, ch) {
    const p = state.preset;
    
    if (p === 'polaroid') {
      const margin = 60;
      const width = cw - (margin * 2);
      context.beginPath();
      context.rect(margin, margin, width, width);
      context.clip();
    } else if (p === 'gallery') {
      const padding = (state.frameCustom.gallery.size / 100) * cw;
      context.beginPath();
      context.rect(padding, padding, cw - (padding * 2), ch - (padding * 2));
      context.clip();
    } else if (p === 'custom-border') {
      const w = state.frameCustom.border.width;
      const r = state.frameCustom.border.radius;
      context.beginPath();
      if (context.roundRect) {
        context.roundRect(w, w, cw - (w * 2), ch - (w * 2), r);
      } else {
        context.rect(w, w, cw - (w * 2), ch - (w * 2));
      }
      context.clip();
    } else if (p === 'neon') {
      const pad = 30;
      context.beginPath();
      context.rect(pad, pad, cw - (pad * 2), ch - (pad * 2));
      context.clip();
    }
  }

  function drawFrameOverlay(cw, ch) {
    const p = state.preset;
    
    switch (p) {
      case 'polaroid':
        drawPolaroidFrame(cw, ch);
        break;
      case 'gallery':
        drawGalleryFrame(cw, ch);
        break;
      case 'custom-border':
        drawCustomBorderFrame(cw, ch);
        break;
      case 'neon':
        drawNeonFrame(cw, ch);
        break;
      case 'gold':
        drawImageFrame(presetImages.gold, cw, ch);
        break;
      case 'wood':
        drawImageFrame(presetImages.wood, cw, ch);
        break;
      case 'custom-frame-overlay':
        drawUploadedCustomFrame(cw, ch);
        break;
    }
  }

  // 1. Polaroid
  function drawPolaroidFrame(cw, ch) {
    ctx.fillStyle = '#fefefe';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    ctx.fillRect(0, 0, cw, ch);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    const margin = 60;
    const innerSize = cw - (margin * 2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, innerSize, innerSize);
    
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.fillRect(margin, margin, innerSize, innerSize);

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fontSize = Math.max(24, Math.round(cw * 0.045));
    ctx.font = `${fontSize}px ${state.frameCustom.polaroid.font}`;
    
    const textY = cw + ((ch - cw) / 2) - 10;
    ctx.fillText(state.frameCustom.polaroid.text, cw / 2, textY);
  }

  // 2. Gallery Passe-partout
  function drawGalleryFrame(cw, ch) {
    const sizePercent = state.frameCustom.gallery.size;
    const padding = (sizePercent / 100) * cw;
    const matColor = state.frameCustom.gallery.color;
    
    ctx.fillStyle = matColor;
    
    ctx.fillRect(0, 0, cw, padding); 
    ctx.fillRect(0, ch - padding, cw, padding); 
    ctx.fillRect(0, padding, padding, ch - (padding * 2)); 
    ctx.fillRect(cw - padding, padding, padding, ch - (padding * 2)); 
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, cw - (padding * 2), ch - (padding * 2));
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding - 2, padding - 2, cw - (padding * 2) + 4, ch - (padding * 2) + 4);
    
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(6, Math.round(cw * 0.015));
    ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, cw - ctx.lineWidth, ch - ctx.lineWidth);
  }

  // 3. Procedural Border
  function drawCustomBorderFrame(cw, ch) {
    const w = state.frameCustom.border.width;
    const r = state.frameCustom.border.radius;
    const color = state.frameCustom.border.color;
    const shadow = state.frameCustom.border.shadow;
    
    ctx.fillStyle = color;
    
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, cw, ch, r);
      ctx.rect(cw - w, w, -(cw - (w * 2)), ch - (w * 2));
    } else {
      ctx.rect(0, 0, cw, ch);
      ctx.rect(cw - w, w, -(cw - (w * 2)), ch - (w * 2));
    }
    ctx.fill();
    
    if (shadow) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 12;
      ctx.strokeRect(w, w, cw - (w * 2), ch - (w * 2));
      ctx.restore();
    }
  }

  // 4. Cyberpunk Glow
  function drawNeonFrame(cw, ch) {
    const pad = 30;
    
    ctx.fillStyle = 'rgba(10, 11, 18, 0.9)';
    ctx.fillRect(0, 0, cw, pad); 
    ctx.fillRect(0, ch - pad, cw, pad); 
    ctx.fillRect(0, pad, pad, ch - (pad * 2)); 
    ctx.fillRect(cw - pad, pad, pad, ch - (pad * 2)); 
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, cw - (pad * 2), ch - (pad * 2));

    ctx.save();
    ctx.shadowBlur = 15;
    
    ctx.strokeStyle = state.frameCustom.neon.color1;
    ctx.shadowColor = state.frameCustom.neon.color1;
    ctx.lineWidth = 4;
    ctx.strokeRect(pad + 4, pad + 4, cw - (pad * 2) - 8, ch - (pad * 2) - 8);
    
    ctx.strokeStyle = state.frameCustom.neon.color2;
    ctx.shadowColor = state.frameCustom.neon.color2;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad + 12, pad + 12, cw - (pad * 2) - 24, ch - (pad * 2) - 24);
    
    ctx.restore();
    
    ctx.fillStyle = state.frameCustom.neon.color2;
    const accentLen = 15;
    
    ctx.fillRect(pad + 16, pad + 16, accentLen, 2);
    ctx.fillRect(pad + 16, pad + 16, 2, accentLen);
    
    ctx.fillRect(cw - pad - 16 - accentLen, ch - pad - 18, accentLen, 2);
    ctx.fillRect(cw - pad - 18, ch - pad - 16 - accentLen, 2, accentLen);
  }

  // 5. Preset Images
  function drawImageFrame(presetObj, cw, ch) {
    if (!presetObj || !presetObj.loaded) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, cw - 20, ch - 20);
      return;
    }
    const drawable = presetObj.processedCanvas || presetObj.img;
    ctx.drawImage(drawable, 0, 0, cw, ch);
  }

  // 6. Custom Frame Overlay
  function drawUploadedCustomFrame(cw, ch) {
    if (!state.customFrame.loaded) return;
    const drawable = state.customFrame.processedCanvas || state.customFrame.image;
    ctx.drawImage(drawable, 0, 0, cw, ch);
  }

  // --- Export and Downloads ---
  function downloadFramedPhoto() {
    if (!state.photo.loaded) {
      showToast('Please upload a photo first!', 'danger');
      return;
    }
    
    showLoader(true);
    showToast('Preparing high-resolution export...');
    
    setTimeout(() => {
      try {
        const mimeType = selectExportFormat.value;
        const quality = mimeType === 'image/jpeg' ? (parseInt(sliderExportQuality.value) / 100) : 1.0;
        
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        const extension = mimeType === 'image/png' ? 'png' : 'jpg';
        const rawName = state.photo.name.substring(0, state.photo.name.lastIndexOf('.')) || 'photo';
        const fileName = `${rawName}_framed.${extension}`;
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showLoader(false);
        showToast('Download started successfully!');
      } catch (err) {
        console.error('Export fail:', err);
        showLoader(false);
        showToast('Export failed. Ensure images do not violate CORS restrictions.', 'danger');
      }
    }, 100);
  }

  // --- UI Helpers ---
  function showLoader(visible) {
    if (visible) {
      canvasLoader.classList.remove('hidden');
    } else {
      canvasLoader.classList.add('hidden');
    }
  }

  function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    if (type === 'danger') {
      toast.style.background = 'rgba(239, 68, 68, 0.9)';
      toast.style.boxShadow = '0 10px 30px rgba(239, 68, 68, 0.25)';
    } else {
      toast.style.background = 'rgba(16, 185, 129, 0.9)';
      toast.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.25)';
    }
    
    toast.classList.remove('hidden');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  init();
});
