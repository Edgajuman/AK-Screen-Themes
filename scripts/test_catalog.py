import unittest
import catalog
import json
import tempfile
from pathlib import Path
class CatalogueTests(unittest.TestCase):
    def test_paths_are_bounded_and_passive(self):
        self.assertTrue(catalog.safe_path('assets/backgrounds/editor.webp'))
        for path in ('../x.png','/x.png','C:/x.png','a\\x.png','a/%2e.png','tool.exe','a//x.png'):
            self.assertFalse(catalog.safe_path(path))
    def test_existing_themes_normalize_and_include_components(self):
        data=catalog.catalogue('0'*40)
        self.assertGreaterEqual(len(data['themes']),2)
        sakura=next(t for t in data['themes'] if t['id']=='sakura-pulse')
        self.assertEqual(sakura['author'],'edgajuman')
        self.assertEqual(len(sakura['colors']),15)
        self.assertTrue(sakura['font'])
        self.assertNotIn('theme.json',[a['path'] for a in sakura['assets']])
        self.assertTrue(all(len(a['sha256'])==64 for a in sakura['assets']))
    def test_unresolved_svg_colors_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            folder=Path(temporary)/'author'/'sample'
            folder.mkdir(parents=True)
            (folder/'theme.json').write_text(json.dumps(dict(schema=1,id='sample',name='Sample',version='1.0.0',preview='',icons={'Play':'play.svg'})),encoding='utf-8')
            (folder/'LICENSE.txt').write_text('MIT',encoding='utf-8')
            (folder/'play.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"><path fill="{text}" d="M0 0h10v10z"/></svg>',encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'marcadores de color'):
                catalog.package(folder,'0'*40)

    def test_advanced_style_and_catalogue_compatibility(self):
        themes=catalog.catalogue('0'*40)['themes']
        advanced=next(t for t in themes if t['id']=='ak-studio-pro')
        self.assertEqual(len(advanced['colors']),47)
        self.assertEqual(advanced['min_app_version'],'2.2.0')
        self.assertEqual(advanced['stylesheet'],'editor.css')
        catalog.validate_layout(advanced['style']['layout'])
        self.assertTrue(advanced['font'])
    def test_active_css_and_invalid_layout_are_rejected(self):
        for css in ('@import x;', '.panel { background-color:url(x); }', '.unknown { color:#123456; }', ':root { --invalid:#123456; }', '.panel { gap:NaN; }'):
            with self.assertRaises(ValueError): catalog.validate_css(css)
        with self.assertRaises(ValueError): catalog.validate_layout({'Tabs':{'panels':['Program','Program'],'active':0}})
        with self.assertRaises(ValueError): catalog.validate_layout({'Tabs':{'panels':[],'active':0}})

    def test_every_native_akscreen_panel_is_available_to_the_theme_studio(self):
        # Keep the catalogue validator in sync with ui-egui::dock::PanelKind.
        for panel in ('Camera', 'Extensions'):
            catalog.validate_layout({'Tabs':{'panels':[panel], 'active':0}})
