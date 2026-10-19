"""Import untouched bitmap fills from a browser-exported, ID-labelled Figma SVG.

Usage: python3 scripts/import-ruffle-artwork.py exported.zip public/images/figma [heart|swirl]
Requires the project's existing sharp package; never contacts Figma or edits its file.
"""
import base64
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile

SVG = '{http://www.w3.org/2000/svg}'
HREF = '{http://www.w3.org/1999/xlink}href'
archive, destination = Path(sys.argv[1]), Path(sys.argv[2])
design = sys.argv[3] if len(sys.argv) > 3 else 'heart'
assert design in ['heart', 'swirl']
component = 'Ruffle Locket' if design == 'heart' else 'Swirl Bow'
with zipfile.ZipFile(archive) as bundle:
    source = bundle.read(component + '/variants.svg')
root = ET.fromstring(source)
nodes = {node.get('id'): node for node in root.iter() if node.get('id')}
variants, files = [], {}


def bitmap(group, label, filename):
    rect = next(node for node in group.iter() if node.tag == SVG + 'rect' and node.get('id', '').split('_')[0] == label)
    pattern = nodes[re.fullmatch(r'url\(#([^\)]+)\)', rect.get('fill')).group(1)]
    use = pattern.find(SVG + 'use')
    image = nodes[use.get(HREF)[1:]]
    assert image.tag == SVG + 'image'
    data = image.get(HREF)
    assert data.startswith('data:image/png;base64,')
    content = base64.b64decode(data.split(',', 1)[1], validate=True)
    digest = hashlib.sha256(content).hexdigest()
    if filename in files:
        assert files[filename]['sha256'] == digest, 'Conflicting source mapping'
    files[filename] = {'content': content, 'sha256': digest}
    return {'file': filename, 'imageId': image.get('id'), 'sha256': digest,
            'width': int(image.get('width')), 'height': int(image.get('height'))}


for group in root.iter(SVG + 'g'):
    label = group.get('id', '')
    if not label.endswith('Open=None'):
        continue
    properties = dict(part.split('=', 1) for part in label.split(', '))
    assert properties['Plating'] in ['Gold', 'Rhodium']
    assert properties['Gemstone'] in (['Aquamarine', 'Pink Tourmaline'] if design == 'heart' else ['Aquamarine', 'Green Amethyst'])
    assert properties['Finish'] in ['High Polish', 'Matte']
    metal, stone, finish = [properties[key].lower().replace(' ', '-') for key in ['Plating', 'Gemstone', 'Finish']]
    if design == 'heart':
        assert properties['Star'] in ['Sapphire', 'Yellow sapphire']
        star = properties['Star'].lower().replace(' ', '-')
        front = bitmap(group, 'locket image', f'heart-{metal}-{stone}-{finish}-{star}.webp')
        inside = bitmap(group, 'lid inside', f'heart-{metal}-{finish}-inside.webp')
        variants.append({'variant': label, 'front': front, 'inside': inside})
    else:
        front = bitmap(group, 'locket image', f'swirl-{metal}-{stone}-{finish}-front.webp')
        underneath = bitmap(group, 'lid inside', f'swirl-{metal}-{stone}-{finish}-underneath.webp')
        variants.append({'variant': label, 'front': front, 'underneath': underneath})

assert (len(variants), len(files)) == ((16, 20) if design == 'heart' else (8, 16)), 'Incomplete source artwork set'
manifest = {'source': 'Figma native SVG export: ' + component + ' / variants (' + ('488:39092' if design == 'heart' else '652:131912') + ')',
            'sourceSha256': hashlib.sha256(source).hexdigest(), 'variants': variants}
destination.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='valleys-ruffle-') as temporary:
    conversions = []
    for filename, record in files.items():
        png = Path(temporary) / (filename + '.png')
        png.write_bytes(record['content'])
        conversions.append({'input': str(png), 'output': str(destination / filename)})
    subprocess.run(['node', '-e', "const fs=require('node:fs'),sharp=require('sharp');const files=JSON.parse(fs.readFileSync(0,'utf8'));Promise.all(files.map(f=>sharp(f.input).webp({lossless:true}).toFile(f.output))).then(()=>console.log('Imported '+files.length+' original bitmap fills')).catch(e=>{console.error(e.message);process.exitCode=1})"], input=json.dumps(conversions), text=True, check=True)
(destination / (design + '-artwork-manifest.json')).write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Verified {len(variants)} named variants; no rendered UI or SVG paths used as images.')
