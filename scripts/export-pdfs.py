"""Optional macOS authoring step using installed Microsoft Word/PowerPoint.
Exports temporary copies, never saves or edits intake originals. Not part of CI.
"""
from pathlib import Path
import subprocess, shutil, hashlib, json
ROOT=Path(__file__).resolve().parents[1]
JOBS=[
 ('Books/FAA Remote Pilot Study Guide.docx','part107-study-guide'),
 ('Books/Remote Aircraft Textbook.docx','remote-aircraft-textbook'),
 ('RC-Airplanes/Trainer-Airplane/AltitudeUnknown_Trainer_Build_Instructions.docx','trainer-build-instructions'),
 ('PowerPoints/Aviation Regulatory System-107.pptx','regulations'),
 ('PowerPoints/National Airspace System-107.pptx','airspace'),
 ('PowerPoints/Weather-107.pptx','weather'),
 ('PowerPoints/Operations-107.pptx','operations'),
 ('PowerPoints/Loading and Performance-107.pptx','loading-performance'),
]
for relative,name in JOBS:
 source=ROOT/'ASCEND-Materials'/relative
 working=ROOT/'artifacts/conversion-inputs'/(name+source.suffix)
 output=ROOT/'artifacts/pdf-exports'/(name+'.pdf')
 working.parent.mkdir(parents=True,exist_ok=True);output.parent.mkdir(parents=True,exist_ok=True)
 signature=hashlib.file_digest(source.open('rb'),'sha256').hexdigest()
 stamp=output.with_suffix('.source.json')
 cached=json.loads(stamp.read_text()) if stamp.exists() else {}
 if not output.exists() or cached.get('sourceSha256') != signature:
  shutil.copyfile(source,working)
  app='word' if source.suffix=='.docx' else 'powerpoint'
  print(f'Exporting {name} with {app}',flush=True)
  subprocess.run(['osascript',str(ROOT/'scripts'/f'export-{app}.applescript'),str(working),str(output)],check=True,timeout=650)
 if not output.exists() or output.read_bytes()[:5] != b'%PDF-': raise ValueError(f'Missing/invalid PDF: {output}')
 stamp.write_text(json.dumps({'sourceSha256':signature,'source':relative},indent=2)+'\n')
 print(f'{name}: {output.stat().st_size/1048576:.2f} MiB',flush=True)
