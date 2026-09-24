"""Create smaller reading PDFs from Office exports; keep every source unchanged.
Optional authoring tool: Python + PyMuPDF 1.28.2 (not used by the site build).
"""
from pathlib import Path
import json, hashlib, shutil
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'artifacts/pdf-exports'
OUTPUT=ROOT/'artifacts/reading-copies'
OUTPUT.mkdir(parents=True,exist_ok=True)
report=[]
for source in sorted(SOURCE.glob('*.pdf')):
 output=OUTPUT/source.name
 with pymupdf.open(source) as doc:
  before_text=[page.get_text() for page in doc]
  before_links=sum(len(page.get_links()) for page in doc)
  doc.rewrite_images(dpi_threshold=220,dpi_target=160,quality=85)
  doc.save(output,garbage=4,deflate=True,use_objstms=1)
 with pymupdf.open(output) as doc:
  assert [page.get_text() for page in doc] == before_text, f'Text changed: {source.name}'
  assert sum(len(page.get_links()) for page in doc) == before_links, f'Links changed: {source.name}'
  item={'file':source.name,'pages':len(doc),'originalBytes':source.stat().st_size,'readingBytes':output.stat().st_size,'textPreserved':True,'links':before_links,'tool':'PyMuPDF '+pymupdf.VersionBind,'imageDpi':160,'jpegQuality':85}
  report.append(item)
  print(f'{source.name}: {len(doc)} pages, {source.stat().st_size/1048576:.1f} -> {output.stat().st_size/1048576:.1f} MiB; text and links preserved',flush=True)
(ROOT/'artifacts/pdf-verification.json').write_text(json.dumps(report,indent=2)+'\n')
