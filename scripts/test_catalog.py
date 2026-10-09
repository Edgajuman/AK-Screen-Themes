import unittest
import catalog
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
