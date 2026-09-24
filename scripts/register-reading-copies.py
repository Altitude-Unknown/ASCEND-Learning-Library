"""Register verified reading PDFs in the shared file catalog."""
from pathlib import Path
import json,hashlib,shutil,re
ROOT=Path(__file__).resolve().parents[1]
manifest=ROOT/'content/_data/materials.json'
previous={a['id']:a for a in json.loads(manifest.read_text())}
assets=[a for a in previous.values() if not a.get('derived')]
report=json.loads((ROOT/'artifacts/pdf-verification.json').read_text())
resource_ids={'airspace':'airspace-presentation','regulations':'regulations-presentation','weather':'weather-presentation','operations':'operations-presentation','loading-performance':'loading-performance-presentation','part107-study-guide':'airspace-book','remote-aircraft-textbook':'remote-aircraft-textbook','trainer-build-instructions':'trainer-build-instructions'}
for item in report:
 source=ROOT/'artifacts/reading-copies'/item['file'];name=source.stem;asset_id=name+'-pdf'
 size=source.stat().st_size;hosted=size<=25*1024*1024
 local_path=('downloads/imported/' if hosted else 'local-materials/')+source.name
 if hosted:
  dest=ROOT/'public'/local_path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
 assets.append(dict(id=asset_id,source=source.name,filename=source.name,format='PDF',bytes=size,sha256=hashlib.file_digest(source.open('rb'),'sha256').hexdigest(),localPath=local_path,hostedLocally=hosted,publicUrl=previous.get(asset_id,{}).get('publicUrl',''),derived=True,pages=item['pages']))
 p=ROOT/'content/resources'/(resource_ids[name]+'.md');text=p.read_text()
 if f'- {asset_id}\n' not in text:text=text.replace('assetIds:\n',f'assetIds:\n- {asset_id}\n')
 text=re.sub(r'^format: (?:DOCX|PPTX)$',lambda m:'format: PDF / '+m[0].split(': ')[1],text,flags=re.M)
 p.write_text(text)
manifest.write_text(json.dumps(assets,indent=2)+'\n')
(ROOT/'docs/PDF-VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'Registered {len(report)} PDFs; all {len(assets)} assets have manifest records.')
