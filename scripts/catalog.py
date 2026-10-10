"""Validate reviewed theme folders and generate immutable, checksum-verified packages."""
import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
IDENT = re.compile(r"[A-Za-z0-9_-]{1,80}\Z")
COLOR = re.compile(r"#[0-9a-fA-F]{6}\Z")
COLOR_ROLES = {'guide','snap','graph_bg','graph_grid','graph_curve','graph_velocity','graph_handle','keyframe','safe_margin','tl_bg', 'tl_ruler_text', 'text', 'field_border', 'accent', 'hot_text', 'separator', 'app_bg', 'clip_selected_border', 'tl_ruler_tick', 'in_out_shade', 'tl_track_bg_alt', 'focus', 'tl_header_bg', 'tab_bg', 'text_faint', 'accent_hover', 'panel_bg', 'row_alt', 'playhead', 'tab_text_active', 'render_yellow', 'tab_text', 'pressed', 'field_bg', 'row_selected', 'icon', 'render_green', 'icon_active', 'danger', 'tl_ruler_bg', 'render_red', 'timecode', 'header_bg', 'hover', 'tl_track_bg', 'monitor_bg', 'text_dim'}
EXTENSIONS = {'.png','.jpg','.jpeg','.gif','.webp','.svg','.ttf','.otf','.json','.md','.txt','.attribution','.css'}
ROLES = {'accent':'accent','background':'window','header':'panel_alt','panel':'panel','tabs':'panel_alt','text':'text','secondary':'muted','field':'surface','border':'border','selection':'selection','track':'track','trackAlternate':'panel_alt','monitor':'canvas','hover':'surface_hover','danger':'danger'}


METRICS = {'radius','radius_sm','gap','tab_h','header_h','control_h','font_scale','animation_time','panel_border_width','panel_border_opacity','focus_border_opacity'}
SELECTORS = {':root','#editor','.panel','.tabs','.timeline','.toolbar','.button','.input','.menu','.text'}
CSS_PROPERTIES = {
 '#editor':{'background-color'},'.panel':{'background-color','border-color','border-width','border-opacity','focus-opacity','border-radius','gap'},
 '.tabs':{'background-color','color','height'},'.timeline':{'background-color'},'.toolbar':{'background-color','height'},
 '.button':{'border-radius','height','background-color'},'.input':{'border-radius','background-color','border-color'},
 '.menu':{'animation-duration'},'.text':{'color','font-scale'}
}
PANELS = {'Project','MediaBrowser','Libraries','Info','Effects','Markers','History','Source','EffectControls','AudioClipMixer','Metadata','Program','Timeline','Tools','AudioMeters','AudioTrackMixer','LumetriColor','LumetriScopes','EssentialGraphics','EssentialSound','Properties','Text','Events','Progress','ReferenceMonitor','Timecode'}

def validate_css(text):
    if len(text.encode('utf-8'))>64*1024: raise ValueError('CSS demasiado grande')
    text=re.sub(r'/\*.*?\*/','',text,flags=re.S)
    if re.search(r'@|url\s*\(|[<>\\]',text,re.I): raise ValueError('CSS contiene contenido activo')
    for block in text.split('}'):
        if not block.strip(): continue
        parts=block.split('{')
        if len(parts)!=2: raise ValueError('CSS: bloque inválido')
        selector,body=map(str.strip,parts)
        if selector not in SELECTORS: raise ValueError('CSS: selector no compatible')
        for declaration in body.split(';'):
            if not declaration.strip(): continue
            prop,sep,value=declaration.partition(':');prop=prop.strip();value=value.strip()
            if not sep: raise ValueError('CSS: declaración inválida')
            if selector==':root':
                token=prop.removeprefix('--').replace('-','_')
                if not prop.startswith('--') or token not in (METRICS|COLOR_ROLES): raise ValueError('CSS: token desconocido')
            elif prop not in CSS_PROPERTIES[selector]: raise ValueError('CSS: propiedad no compatible')
            if not COLOR.fullmatch(value) and not re.fullmatch(r'-?(?:\d+(?:\.\d*)?|\.\d+)(?:px|s)?',value): raise ValueError('CSS: valor inválido')
    if text.count('{')!=text.count('}'): raise ValueError('CSS: bloque sin cerrar')

def validate_layout(layout):
    seen=set();nodes=0
    def walk(node,depth):
        nonlocal nodes
        nodes+=1
        if depth>32 or nodes>127 or not isinstance(node,dict) or len(node)!=1: raise ValueError('Layout demasiado grande o inválido')
        if 'Tabs' in node:
            tabs=node['Tabs'];panels=tabs.get('panels',[]);active=tabs.get('active',-1)
            if not panels or len(panels)>26 or not isinstance(active,int) or not 0<=active<len(panels): raise ValueError('Layout: pestañas inválidas')
            for panel in panels:
                if panel not in PANELS or panel in seen: raise ValueError('Layout: panel desconocido o duplicado')
                seen.add(panel)
        elif 'Split' in node:
            split=node['Split'];size=split.get('size',{})
            if not isinstance(split.get('vertical'),bool) or not isinstance(size,dict) or len(size)!=1: raise ValueError('Layout: separación inválida')
            key,value=next(iter(size.items()))
            if key not in {'Ratio','FixedA','FixedB'} or not isinstance(value,(int,float)) or not (0.05<=value<=0.95 if key=='Ratio' else 20<=value<=4096): raise ValueError('Layout: tamaño inválido')
            walk(split.get('a'),depth+1);walk(split.get('b'),depth+1)
        else: raise ValueError('Layout: nodo desconocido')
    walk(layout,0)

def safe_path(value):
    return isinstance(value,str) and 0 < len(value) <= 240 and not any(c in value for c in '\\:%') and all(p and p not in ('.','..') and not p.startswith('.') for p in value.split('/')) and Path(value).suffix.lower() in EXTENSIONS

def normalize(raw, author):
    legacy = raw.get('schema_version') == 1
    if not legacy and raw.get('schema') != 1: raise ValueError('schema / schema_version debe ser 1')
    theme = {key:raw.get(key,'') for key in ('id','name','version','description')}
    theme.update(schema=1,author=author,base=raw.get('inherits','dark') if legacy else raw.get('base','dark'))
    if not IDENT.fullmatch(theme['id']) or not IDENT.fullmatch(author): raise ValueError('Autor o identificador inválido')
    if not isinstance(theme['name'],str) or not 1 <= len(theme['name']) <= 160: raise ValueError('Nombre inválido')
    if len(theme['description']) > 4096 or not re.fullmatch(r'\d+\.\d+\.\d+',theme['version']): raise ValueError('Descripción o versión inválida')
    if theme['base'].lower() not in ('dark','medium','light','studioblue','oled'): raise ValueError('Tema base inválido')
    colors = raw.get('colors',{})
    theme['colors'] = {key:colors[source] for key,source in ROLES.items() if source in colors} if legacy else colors
    if set(theme['colors']) - (set(ROLES) | COLOR_ROLES) or not all(COLOR.fullmatch(v) for v in theme['colors'].values()): raise ValueError('Colores: usa los 15 roles admitidos y #RRGGBB')
    def image(name):
        value=raw.get('backgrounds',{}).get(name,{})
        return value.get('image','') if isinstance(value,dict) else ''
    theme['preview'] = raw.get('marketplace',{}).get('preview','preview.png') if legacy else raw.get('preview','preview.png')
    theme['editor_background'] = image('editor') if legacy else raw.get('editor_background','')
    theme['splash_background'] = image('splash') if legacy else raw.get('splash_background','')
    theme['font'] = raw.get('typography',{}).get('file','') if legacy else raw.get('font','')
    theme['icons'] = raw.get('icons',{})
    theme['stylesheet'] = raw.get('stylesheet','')
    theme['min_app_version'] = raw.get('min_app_version','2.1.0')
    if not re.fullmatch(r'\d+\.\d+\.\d+',theme['min_app_version']): raise ValueError('Versión mínima inválida')
    if theme['stylesheet'] and tuple(map(int,theme['min_app_version'].split('.'))) < (2,2,0): raise ValueError('CSS requiere AK Screen 2.2.0')
    theme['style'] = raw if legacy else raw.get('style',{})
    if 'layout' in theme['style']: validate_layout(theme['style']['layout'])
    if 'css' in theme['style']: validate_css(theme['style']['css'])
    if tuple(map(int,theme['min_app_version'].split('.'))) < (2,2,0) and set(theme['colors']) & {'guide','snap','graph_bg','graph_grid','graph_curve','graph_velocity','graph_handle','keyframe','safe_margin'}: raise ValueError('Los nuevos colores requieren AK Screen 2.2.0')
    return theme

def package(folder, revision):
    author=folder.parent.name
    for path in (folder,folder.parent):
        if path.is_symlink(): raise ValueError('No se permiten enlaces simbólicos')
    raw=json.loads((folder/'theme.json').read_text(encoding='utf-8-sig'))
    theme=normalize(raw,author)
    if folder.name != theme['id']: raise ValueError('El id debe coincidir con la carpeta del tema')
    assets=[]
    total=0
    seen=set()
    for file in sorted(folder.rglob('*')):
        if file.is_symlink(): raise ValueError('No se permiten enlaces simbólicos')
        if not file.is_file(): continue
        name=file.relative_to(folder).as_posix()
        if name=='theme.json': continue
        if not safe_path(name) or name.lower() in seen: raise ValueError(f'Ruta inválida: {name}')
        seen.add(name.lower())
        size=file.stat().st_size
        total+=size
        if size > 16*1024*1024 or total > 64*1024*1024 or len(assets)>=256: raise ValueError('Paquete demasiado grande')
        if file.suffix.lower() in ('.ttf','.otf') and size > 8*1024*1024: raise ValueError('Fuente supera 8 MB')
        if file.suffix.lower()=='.css':
            text=file.read_text(encoding='utf-8')
            validate_css(text)
        if file.suffix.lower()=='.svg':
            text=file.read_text(encoding='utf-8')
            if size>256*1024 or '<!DOCTYPE' in text or '<!ENTITY' in text: raise ValueError('SVG no válido')
            if re.search(r'\{[A-Za-z_][A-Za-z_0-9]*\}', text): raise ValueError('SVG contiene marcadores de color sin resolver; usa colores explícitos')
            tree=ET.fromstring(text)
            if sum(1 for _ in tree.iter())>2000: raise ValueError('SVG demasiado complejo')
            for node in tree.iter():
                if node.tag.split('}')[-1] in ('script','foreignObject'): raise ValueError('SVG contiene contenido activo')
                for key,value in node.attrib.items():
                    if key.split('}')[-1]=='href' and not value.startswith('#'): raise ValueError('SVG contiene una referencia externa')
        assets.append(dict(path=name,size=size,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
    for resource in [theme['preview'],theme['editor_background'],theme['splash_background'],theme['font'],theme['stylesheet'],*theme['icons'].values()]:
        if resource and (not safe_path(resource) or resource.lower() not in seen): raise ValueError(f'Falta el recurso: {resource}')
    if not any(a['path'].lower().startswith(('license','info')) for a in assets): raise ValueError('Incluye LICENSE.txt o info.md con licencia y créditos')
    if theme['font'] and not any('license' in a['path'].lower() for a in assets): raise ValueError('Incluye la licencia de la fuente')
    theme.update(revision=revision,assets=assets)
    return theme

def catalogue(revision):
    if not re.fullmatch('[0-9a-f]{40}',revision): raise ValueError('Revisión inválida')
    themes=[]
    for manifest in sorted((ROOT/'themes').glob('*/*/theme.json')):
        if len(themes)>=100: raise ValueError('Catálogo supera 100 temas')
        try: themes.append(package(manifest.parent,revision))
        except (ValueError,KeyError,TypeError,ET.ParseError) as e: raise ValueError(f'{manifest.relative_to(ROOT)}: {e}') from e
    return dict(schema=1,themes=themes)

def build(revision):
    data=catalogue(revision)
    output=ROOT/'packages'; output.mkdir(exist_ok=True)
    for theme in data['themes']:
        folder=ROOT/'themes'/theme['author']/theme['id']
        path=output/f"{theme['author']}-{theme['id']}.zip"
        with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
            z.writestr('theme.json',json.dumps(theme,ensure_ascii=False,indent=2)+'\n')
            for a in theme['assets']: z.write(folder/a['path'],a['path'])
        theme['download']=f"https://github.com/Edgajuman/AK-Screen-Themes/releases/download/themes-{revision[:12]}/{path.name}"
    legacy=dict(schema=1,themes=[t for t in data['themes'] if tuple(map(int,t['min_app_version'].split('.'))) <= (2,1,0)])
    (ROOT/'themes.json').write_text(json.dumps(legacy,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'themes-v2.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    site=ROOT/'site'; site.mkdir(exist_ok=True)
    (site/'index.html').write_bytes((ROOT/'index.html').read_bytes())
    for name in ('theme-studio.html','theme-studio.css','theme-studio.js','theme-preview.html'):
        (site/name).write_bytes((ROOT/name).read_bytes())
    (site/'themes.json').write_bytes((ROOT/'themes-v2.json').read_bytes())
    script='window.AKSCREEN_THEMES = '+json.dumps(data,ensure_ascii=False).replace('<','\\u003c')+';\n'
    (ROOT/'catalog-data.js').write_text(script,encoding='utf-8')
    (site/'catalog-data.js').write_text(script,encoding='utf-8')
    return data

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--check',action='store_true'); parser.add_argument('--revision')
    args=parser.parse_args()
    revision=args.revision or subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    data=catalogue(revision) if args.check else build(revision)
    print(f"{len(data['themes'])} temas validados" )
