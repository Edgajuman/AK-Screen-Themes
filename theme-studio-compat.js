/* Convert published 2.0/2.1 themes to current editable tokens. No resource is executed. */
(() => {
  'use strict';
  const ALIASES = {
    window:['app_bg'],background:['app_bg'],panel:['panel_bg'],panel_alt:['tab_bg','header_bg'],
    header:['header_bg'],tabs:['tab_bg'],surface:['field_bg'],field:['field_bg'],
    surface_hover:['hover'],muted:['text_dim','tab_text'],secondary:['text_dim','tab_text'],
    border:['field_border','separator'],selection:['row_selected'],track:['tl_track_bg'],
    trackAlternate:['tl_track_bg_alt'],canvas:['monitor_bg'],monitor:['monitor_bg'],timeline:['tl_bg']
  };
  const ICON_ALIASES = {cursor:'Selection',media:'Film',audio:'Audio',text:'Type',effects:'Fx',transition:'Fx',
    import:'Insert',record:'Mic',tutorial:'Captions',ui:'Workspaces',camera:'Camera',sub:'Captions',
    smart:'Sparkle',home:'Home',export:'Export',split:'Razor',duplicate:'NewItem',delete:'Trash',
    undo:'Undo',redo:'Redo',play:'Play',pause:'Pause',back:'StepBack',forward:'StepFwd',fit:'Wrench',
    fullscreen:'Fullscreen',guide:'Adjust',zoom_in:'Zoom',zoom_out:'Zoom',marker:'Marker',
    keyframe:'Keyframe',lock:'Lock',eye:'Eye',mute:'Mute'};
  function variantMinimum(original) {
    const version = typeof original === 'string' && /^\d+\.\d+\.\d+$/.test(original) ? original : '2.1.0';
    const [major,minor] = version.split('.').map(Number);
    return major > 2 || (major === 2 && minor >= 4) ? version : '2.4.0';
  }
  function normalize(raw, colorRoles, iconRoles) {
    if (!raw || typeof raw !== 'object' || (raw.schema !== 1 && raw.schema_version !== 1)) {
      throw new Error('El tema no usa el esquema AK Screen 1.');
    }
    const legacy = raw.schema_version === 1 ? raw : raw.style?.schema_version === 1 ? raw.style : {};
    const allowed = new Set(colorRoles), colors = {};
    const originalColors = {...(legacy.colors || {}),...(raw.colors || {})};
    for (const [key,value] of Object.entries(originalColors)) {
      if (!/^#[\da-f]{6}$/i.test(value)) throw new Error(`Color inválido: ${key}`);
      for (const role of ALIASES[key] || []) if (allowed.has(role)) colors[role] = value;
    }
    // Explicit native roles take precedence over their historical aliases.
    for (const [key,value] of Object.entries(originalColors)) if (allowed.has(key)) colors[key] = value;
    const style = {...(raw.style || {})}, metrics = {};
    const number = (key,value,min,max) => {
      if (typeof value === 'number' && Number.isFinite(value)) metrics[key] = Math.min(max,Math.max(min,value));
    };
    number('radius',legacy.geometry?.radius?.panel,0,24);
    number('radius_sm',legacy.geometry?.radius?.control,0,24);
    number('panel_border_width',legacy.geometry?.border?.width,0,4);
    if (legacy.typography?.size) number('font_scale',legacy.typography.size / 12,0.75,1.5);
    style.metrics = {...metrics,...(style.metrics || {})};
    const iconSet = new Set(iconRoles), icons = {};
    for (const [role,path] of Object.entries(raw.icons || legacy.icons || {})) {
      const native = ICON_ALIASES[role] || role;
      if (iconSet.has(native) && !icons[native]) icons[native] = path;
    }
    for (const [role,path] of Object.entries(raw.icons || {})) if (iconSet.has(role)) icons[role] = path;
    const image = name => {
      const background = legacy.backgrounds?.[name] || raw.backgrounds?.[name];
      return background && !Array.isArray(background) && typeof background.image === 'string' ? background.image : '';
    };
    return {...raw,schema:1,base:raw.base || raw.inherits || legacy.inherits || 'dark',colors,icons,style,
      min_app_version:raw.min_app_version || '2.1.0',
      editor_background:raw.editor_background || image('editor'),splash_background:raw.splash_background || image('splash'),
      font:raw.font || legacy.typography?.file || '',preview:raw.preview || raw.marketplace?.preview || ''};
  }
  function safeSvgDocument(doc,text) {
    if (doc.querySelector('parsererror') || /<!DOCTYPE|<!ENTITY/i.test(text) ||
        /\{[A-Za-z_][A-Za-z_0-9]*\}/.test(text) || doc.documentElement?.localName !== 'svg') return false;
    const nodes = [doc.documentElement,...doc.documentElement.querySelectorAll('*')];
    const paintAttributes = new Set(['fill','stroke','filter','clip-path','mask','marker-start','marker-mid','marker-end']);
    return nodes.length <= 2000 && nodes.every(node =>
      !['script','foreignObject','style','animate','set','animateTransform','animateMotion'].includes(node.localName) &&
      [...node.attributes].every(attr => {
        const name = attr.localName.toLowerCase();
        if (/^on/i.test(attr.name) || /javascript:/i.test(attr.value)) return false;
        if (['href','src'].includes(name)) return /^#[A-Za-z_][A-Za-z0-9_.:-]*$/.test(attr.value);
        if (/url\s*\(/i.test(attr.value)) {
          // A gradient/mask reference stays inside this SVG; arbitrary URLs cannot load.
          return paintAttributes.has(name) && /^url\(\s*(['"]?)#[A-Za-z_][A-Za-z0-9_.:-]*\1\s*\)$/i.test(attr.value);
        }
        return true;
      }));
  }
  window.AKScreenThemeCompatibility = Object.freeze({normalize,variantMinimum,safeSvgDocument});
})();
