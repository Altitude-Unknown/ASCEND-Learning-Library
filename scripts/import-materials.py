"""Inventory supplied originals, preserving them byte-for-byte.
Run from the project root. Small distribution copies go to public/downloads/imported;
large originals remain outside Git and are served only by the local preview.
"""
from pathlib import Path
import hashlib, json, re, shutil, zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'ASCEND-Materials'
MANIFEST = ROOT / 'content/_data/materials.json'
LIMIT = 25 * 1024 * 1024

def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

def main():
    previous = {a['source']: a for a in json.loads(MANIFEST.read_text())} if MANIFEST.exists() else {}
    records = []
    for path in sorted(SOURCE.rglob('*')):
        if not path.is_file() or path.name.startswith('.'):
            continue
        relative = path.relative_to(SOURCE).as_posix()
        asset_id = slug(str(Path(relative).with_suffix('')))
        if path.suffix.lower() not in {'.docx','.pptx','.stl','.dxf','.f3d','.f3z','.pdf'}:
            raise ValueError(f'Unreviewed file type: {relative}')
        if path.suffix.lower() in {'.docx','.pptx'}:
            with zipfile.ZipFile(path) as archive:
                bad = archive.testzip()
                if bad: raise ValueError(f'Corrupt archive entry: {relative}: {bad}')
        size = path.stat().st_size
        dest = f'downloads/imported/{asset_id}{path.suffix.lower()}'
        record = dict(previous.get(relative, {}))
        record.update(id=asset_id, source=relative, filename=path.name, format=path.suffix[1:].upper(),
                      bytes=size, sha256=hashlib.file_digest(path.open('rb'), 'sha256').hexdigest(),
                      localPath=dest if size <= LIMIT else f'local-materials/{asset_id}{path.suffix.lower()}',
                      hostedLocally=size <= LIMIT)
        record.setdefault('publicUrl', '')
        if size <= LIMIT:
            output = ROOT / 'public' / dest
            output.parent.mkdir(parents=True, exist_ok=True)
            if not output.exists() or hashlib.file_digest(output.open('rb'), 'sha256').hexdigest() != record['sha256']:
                shutil.copyfile(path, output)
        records.append(record)
    # Derived PDF exports are maintained separately and never replace originals.
    records.extend(a for a in previous.values() if a.get('derived'))
    if len({a['id'] for a in records}) != len(records): raise ValueError('Asset ID collision')
    MANIFEST.write_text(json.dumps(records, indent=2) + '\n')
    print(f'Inventoried {len(records)} files; {sum(not a["hostedLocally"] for a in records)} require external storage before public download.')

if __name__ == '__main__': main()
