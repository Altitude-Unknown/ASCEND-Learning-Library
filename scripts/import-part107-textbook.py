#!/usr/bin/env python3
"""Rebuild the five HTML chapters from the supplied DOCX using only stdlib.

Preserves source paragraphs, emphasis, lists, tables, figures, knowledge checks,
answers, and source notes. Figure descriptions are curated separately.
"""
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/downloads/imported/books-faa-remote-pilot-study-guide.docx'
OUTPUT = ROOT / 'content/part107/textbook'
ASSETS = ROOT / 'public/assets/part107/textbook'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
W = '{' + NS['w'] + '}'
FIGURES = json.loads((ROOT / 'editorial/part107-figures.json').read_text())
CHAPTERS = {
    1: ('regulations', 'Aviation Regulatory System', 1),
    2: ('airspace', 'The National Airspace System', 2),
    3: ('weather', 'Weather', 3),
    4: ('uas-operations', 'Operations', 5),
    5: ('loading-and-performance', 'Loading and Performance', 4),
}


def text(node):
    return ''.join(n.text or '' for n in node.findall('.//w:t', NS))


def normalized(value):
    return re.sub(r'\s+', ' ', value).strip()


def inline(node, skip=0):
    result = []
    for run in node.iter(W + 'r'):
        pieces = []
        for item in run:
            if item.tag == W + 't':
                value = item.text or ''
                trim = min(skip, len(value))
                skip -= trim
                pieces.append(html.escape(value[trim:]))
            elif item.tag == W + 'tab':
                pieces.append(' ')
            elif item.tag == W + 'br':
                pieces.append('<br>')
        value = ''.join(pieces)
        for key, tag in [('b', 'strong'), ('i', 'em')]:
            flag = run.find('w:rPr/w:' + key, NS)
            if flag is not None and flag.get(W + 'val') not in ('0', 'false') and value:
                value = f'<{tag}>{value}</{tag}>'
        align = run.find('w:rPr/w:vertAlign', NS)
        if align is not None and align.get(W + 'val') in ('superscript', 'subscript'):
            tag = 'sup' if align.get(W + 'val') == 'superscript' else 'sub'
            value = f'<{tag}>{value}</{tag}>'
        result.append(value)
    return ''.join(result)


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ('p', 'li', 'h2', 'h3', 'th', 'td', 'figcaption', 'pre', 'br'):
            self.parts.append(' ')

    def handle_data(self, data):
        self.parts.append(data)

    def handle_endtag(self, tag):
        if tag in ('p', 'li', 'h2', 'h3', 'th', 'td', 'figcaption', 'pre'):
            self.parts.append(' ')


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    audit = {'source': str(SOURCE.relative_to(ROOT)),
             'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'chapters': []}
    with zipfile.ZipFile(SOURCE) as doc:
        root = ET.fromstring(doc.read('word/document.xml'))
        blocks = list(root.find('w:body', NS))
        rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(doc.read('word/_rels/document.xml.rels'))}
        # No merged cells, equations, or note references in this source. Fail
        # explicitly if a future version needs a richer conversion.
        for unsupported in ['gridSpan', 'vMerge', 'footnoteReference', 'endnoteReference', 'txbxContent']:
            assert not root.findall('.//w:' + unsupported, NS), unsupported
        assert not root.findall('.//{http://schemas.openxmlformats.org/officeDocument/2006/math}oMath')
        starts = [(i, int(m[1])) for i, block in enumerate(blocks)
                  if (m := re.match(r'^Chapter ([1-5]) (?!Summary|Knowledge Check)(.+)$', text(block).strip()))]
        assert [n for _, n in starts] == [1, 2, 3, 4, 5], starts
        for position, (start, number) in enumerate(starts):
            end = starts[position + 1][0] if position + 1 < len(starts) else len(blocks)
            slug, title, course_order = CHAPTERS[number]
            output, toc, expected, images = [], [], [], []
            table_count = 0
            list_type = None
            used_ids = set()
            last_heading = title
            consumed = set()

            def close_list():
                nonlocal list_type
                if list_type:
                    output.append(f'</{list_type}>')
                    list_type = None

            def heading_id(value):
                value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()
                base = re.sub(r'[^a-z0-9]+', '-', value).strip('-') or 'section'
                unique, suffix = base, 2
                while unique in used_ids:
                    unique, suffix = base + '-' + str(suffix), suffix + 1
                used_ids.add(unique)
                return unique

            for index in range(start + 1, end):
                block = blocks[index]
                value = text(block).strip()
                if index in consumed or not value and not block.findall('.//a:blip', NS):
                    continue
                if value == 'FAA REMOTE PILOT TEST PREP':
                    continue  # Repeated printed chapter masthead, not chapter text.
                if block.tag == W + 'tbl':
                    close_list()
                    table_count += 1
                    label = f'{last_heading} — table {table_count}'
                    output.append(f'<div class="textbook-table" role="region" aria-label="{html.escape(label, quote=True)}" tabindex="0"><table><caption>{html.escape(label)}</caption>')
                    for row_index, row in enumerate(block.findall('w:tr', NS)):
                        if row_index == 0:
                            output.append('<thead>')
                        elif row_index == 1:
                            output.append('<tbody>')
                        output.append('<tr>')
                        for col_index, cell in enumerate(row.findall('w:tc', NS)):
                            tag = 'th' if row_index == 0 or col_index == 0 else 'td'
                            scope = ' scope="col"' if row_index == 0 else ' scope="row"' if col_index == 0 else ''
                            content = '<br>'.join(inline(p) for p in cell.findall('w:p', NS))
                            output.append(f'<{tag}{scope}>{content}</{tag}>')
                            if text(cell).strip():
                                expected.append((index, normalized(text(cell))))
                        output.append('</tr>')
                        if row_index == 0:
                            output.append('</thead>')
                    if len(block.findall('w:tr', NS)) > 1:
                        output.append('</tbody>')
                    output.append('</table></div>')
                    continue
                blips = block.findall('.//a:blip', NS)
                if blips:
                    close_list()
                    assert len(blips) == 1 and not value, 'Mixed image/text paragraph requires review'
                    target = rels[blips[0].get('{' + NS['r'] + '}embed')]
                    name = Path(target).name
                    figure = FIGURES[name]
                    destination = ASSETS / figure['filename']
                    destination.write_bytes(doc.read('word/' + target))
                    caption = text(blocks[index + 1]).strip()
                    assert caption and blocks[index + 1].tag == W + 'p', 'Figure needs source caption'
                    consumed.add(index + 1)
                    expected.append((index + 1, normalized(caption)))
                    url = '/assets/part107/textbook/' + figure['filename']
                    output.append(f'<figure class="textbook-figure"><a href="{url}"><img src="{url}" alt="{html.escape(figure["alt"], quote=True)}" loading="lazy"></a><figcaption><p>{html.escape(caption)}</p><p><a href="{url}">Open original figure at full size</a></p>')
                    if figure.get('transcript'):
                        output.append('<p><strong>Report text shown in the figure</strong></p><pre>' + html.escape(figure['transcript']) + '</pre>')
                    output.append('<p><strong>Figure description:</strong> ' + html.escape(figure['description']) + '</p></figcaption></figure>')
                    images.append({'file': figure['filename'], 'source': name,
                                   'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()})
                    continue
                assert block.tag == W + 'p', f'Unsupported chapter block {block.tag}'
                style = block.find('w:pPr/w:pStyle', NS)
                style = style.get(W + 'val', '') if style is not None else ''
                if style.startswith('Heading'):
                    close_list()
                    major = style == 'Heading1' or re.match(r'^[1-5]\.\d+\b', value) or value == 'Learning Objectives'
                    level = 2 if major else 3
                    anchor = heading_id(value)
                    output.append(f'<h{level} id="{anchor}">{inline(block)}</h{level}>')
                    if level == 2:
                        toc.append({'title': value, 'id': anchor})
                    last_heading = value
                    expected.append((index, normalized(value)))
                    continue
                bullet = re.match(r'^\s*[·•]\s+', text(block))
                numbered = re.match(r'^\s*(\d+)\.\s+', text(block))
                if bullet or numbered:
                    desired = 'ul' if bullet else 'ol'
                    if list_type != desired:
                        close_list()
                        start_attr = f' start="{numbered[1]}"' if numbered and numbered[1] != '1' else ''
                        output.append(f'<{desired}{start_attr}>')
                        list_type = desired
                    prefix = (bullet or numbered).end()
                    output.append('<li>' + inline(block, skip=prefix) + '</li>')
                    expected.append((index, normalized(text(block)[prefix:])))
                else:
                    close_list()
                    callout = re.match(r'^(KEY (?:NUMBER|NUMBERS|POINT)|EXAM TIP|SCENARIO|REAL-WORLD POINT|CHART WORKFLOW)\b', value)
                    css = ' class="textbook-callout"' if callout else ''
                    output.append(f'<p{css}>{inline(block)}</p>')
                    expected.append((index, normalized(value)))
            close_list()
            body = '\n'.join(output)
            assert '{{' not in body and '{%' not in body, 'Unexpected template delimiter in source'
            parser = PlainText()
            parser.feed(body)
            rendered_text = normalized(''.join(parser.parts))
            for index, source_text in expected:
                assert source_text in rendered_text, f'Chapter {number}, missing text at block {index}: {source_text[:100]}'
            metadata = {'layout': 'layouts/textbook-chapter.njk', 'tags': [],
                        'eleventyExcludeFromCollections': True, 'topic': 'part107',
                        'title': f'Chapter {number}: {title}',
                        'description': f'Read the complete {title} textbook chapter online, including its knowledge check and answer key.',
                        'chapterNumber': number, 'courseOrder': course_order, 'toc': toc,
                        'permalink': f'/part107/textbook/{slug}/'}
            (OUTPUT / (slug + '.njk')).write_text('---\n' + json.dumps(metadata, indent=2, ensure_ascii=False) + '\n---\n' + body + '\n')
            audit['chapters'].append({'chapter': number, 'slug': slug, 'tables': table_count,
                                      'images': images, 'verifiedTextBlocks': len(expected),
                                      'headingCount': len(toc), 'sourceStartBlock': start,
                                      'sourceEndBlock': end, 'htmlSha256': hashlib.sha256(body.encode()).hexdigest()})
    assert sum(c['tables'] for c in audit['chapters']) == 16
    assert sum(len(c['images']) for c in audit['chapters']) == 18
    (ROOT / 'editorial/part107-textbook-import.json').write_text(json.dumps(audit, indent=2) + '\n')
    print('Imported 5 complete chapters; verified source text, 16 tables, and 18 figures.')


if __name__ == '__main__':
    main()
