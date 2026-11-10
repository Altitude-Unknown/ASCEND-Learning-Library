#!/usr/bin/env python3
"""Rebuild lab manual web chapters from the Remote and Autonomous Aircraft
Systems Word file (stdlib + Pillow).

Usage: python3 scripts/import-lab-manual.py [chapter ...]

Configuration lives in editorial/lab-manual.json:
  chapters  where each chapter goes, which sections are left out of the
            reading (labs, review questions, checksheets are course pages),
            text corrections, and closing HTML.
  figures   one entry per source image (word/media name): a described figure
            ({file, alt, caption}), an equation shown on its own line
            ({equation: html}), or a symbol inside a sentence ({inline: html}).

For each chapter it writes the web chapter, its images, and the course data
file's reviewQuestions (from the chapter list and the answer key) and
skills. Units, outcomes, and readings in the course data file are curated by
hand and are kept. Every source paragraph is checked to appear in the output.
"""
import hashlib
import html
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'editorial/lab-manual.json').read_text())
SOURCE = ROOT / CONFIG['source']
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
W = '{' + NS['w'] + '}'
R = '{' + NS['r'] + '}'
DRAWING = W + 'drawing'


def text(node):
    return ''.join(n.text or '' for n in node.iter(W + 't'))


def normalized(value):
    return re.sub(r'\s+', ' ', value).strip()


class Doc:
    def __init__(self, archive):
        self.zip = archive
        root = ET.fromstring(archive.read('word/document.xml'))
        self.blocks = list(root.find('w:body', NS))
        self.rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(archive.read('word/_rels/document.xml.rels'))}
        styles = ET.fromstring(archive.read('word/styles.xml'))
        self.styles = {}
        for style in styles.iter(W + 'style'):
            name = style.find('w:name', NS)
            self.styles[style.get(W + 'styleId')] = (name.get(W + 'val') if name is not None else '').lower()
        numbering = ET.fromstring(archive.read('word/numbering.xml'))
        abstract = {a.get(W + 'abstractNumId'): {l.get(W + 'ilvl'): l.find('w:numFmt', NS).get(W + 'val')
                                                 for l in a.findall('w:lvl', NS) if l.find('w:numFmt', NS) is not None}
                    for a in numbering.findall('w:abstractNum', NS)}
        self.formats = {n.get(W + 'numId'): abstract[n.find('w:abstractNumId', NS).get(W + 'val')]
                        for n in numbering.findall('w:num', NS)}

    def style(self, block):
        node = block.find('w:pPr/w:pStyle', NS)
        return self.styles.get(node.get(W + 'val'), '') if node is not None else ''

    def heading_level(self, block):
        match = re.match(r'heading (\d)', self.style(block))
        return int(match[1]) if match and text(block).strip() else 0

    def list_info(self, block):
        num = block.find('w:pPr/w:numPr', NS)
        if num is None or num.find('w:numId', NS) is None:
            return None
        num_id = num.find('w:numId', NS).get(W + 'val')
        level = num.find('w:ilvl', NS)
        level = level.get(W + 'val') if level is not None else '0'
        if num_id == '0':
            return None
        fmt = self.formats.get(num_id, {}).get(level, 'bullet')
        return ('ul' if fmt == 'bullet' else 'ol', int(level))


class Converter:
    def __init__(self, doc, number, chapter, figures):
        self.doc, self.number, self.chapter, self.figures = doc, number, chapter, figures
        self.assets = ROOT / 'public/assets' / chapter['assets']
        self.used_figures = []
        self.missing = []

    def image(self, blip):
        target = self.doc.rels[blip.get(R + 'embed')]
        name = Path(target).name
        figure = self.figures.get(name)
        if figure is None:
            self.missing.append(name)
            return name, {'missing': True}
        return name, figure

    def inline(self, paragraph, skip=0):
        """Paragraph content as HTML; inline symbol images become text."""
        out = []

        def run_html(run):
            nonlocal skip
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
                elif item.tag == DRAWING:
                    for blip in item.iter('{' + NS['a'] + '}blip'):
                        name, figure = self.image(blip)
                        if 'inline' in figure:
                            pieces.append(figure['inline'])
            value = ''.join(pieces)
            if value.strip() and not value.startswith('<math'):
                for key, tag in [('b', 'strong'), ('i', 'em')]:
                    flag = run.find('w:rPr/w:' + key, NS)
                    if flag is not None and flag.get(W + 'val') not in ('0', 'false'):
                        value = f'<{tag}>{value}</{tag}>'
                align = run.find('w:rPr/w:vertAlign', NS)
                if align is not None and align.get(W + 'val') in ('superscript', 'subscript'):
                    tag = 'sup' if align.get(W + 'val') == 'superscript' else 'sub'
                    value = f'<{tag}>{value}</{tag}>'
            return value

        for child in paragraph:
            if child.tag == W + 'r':
                out.append(run_html(child))
            elif child.tag == W + 'hyperlink':
                inner = ''.join(run_html(r) for r in child.iter(W + 'r'))
                target = self.doc.rels.get(child.get(R + 'id'))
                if target and inner.strip():
                    out.append(f'<a href="{html.escape(target, quote=True)}">{inner}</a>')
                else:
                    out.append(inner)
            elif child.tag in (W + 'smartTag', W + 'ins', W + 'sdt'):
                out.append(''.join(run_html(r) for r in child.iter(W + 'r')))
        value = ''.join(out)
        # Join adjacent identical emphasis split across runs.
        for tag in ('strong', 'em'):
            value = value.replace(f'</{tag}><{tag}>', '')
        # Word line breaks: keep them outside emphasis, drop them at the ends.
        for _ in range(2):
            value = re.sub(r'\s*<br>\s*(</(?:strong|em)>)', r'\1<br>', value)
            value = re.sub(r'(<(?:strong|em)>)\s*<br>\s*', r'<br>\1', value)
        value = re.sub(r'^(?:\s|<br>)+|(?:\s|<br>)+$', '', value)
        value = re.sub(r'(?:\s*<br>\s*){2,}', '<br>', value)
        return value.strip()

    def block_images(self, block):
        """Figures and equations in a paragraph (not inline symbols)."""
        items = []
        for drawing in block.iter(DRAWING):
            # Word may rotate a picture on the page (60000ths of a degree, clockwise).
            xfrm = drawing.find('.//a:xfrm', NS)
            rotation = round(int(xfrm.get('rot', '0')) / 60000) % 360 if xfrm is not None else 0
            for blip in drawing.iter('{' + NS['a'] + '}blip'):
                name, figure = self.image(blip)
                if 'inline' not in figure:
                    items.append((name, dict(figure, rotation=rotation)))
        return items

    def figure_html(self, name, figure):
        if 'equation' in figure:
            return f'<p class="textbook-equation">{figure["equation"]}</p>'
        if figure.get('missing') or figure.get('omit'):
            return ''
        target = self.doc.rels_by_name[name]
        data = self.doc.zip.read('word/' + target)
        image = Image.open(io.BytesIO(data))
        image.load()
        destination = self.assets / figure['file']
        destination.parent.mkdir(parents=True, exist_ok=True)
        url = f'/assets/{self.chapter["assets"]}/{figure["file"]}'
        caption = f'<figcaption><p>{figure["caption"]}</p></figcaption>' if figure.get('caption') else ''
        if name.endswith('.gif'):
            # Show the first frame; link the animation so it never plays by itself (WCAG 2.2.2).
            animation = destination.with_suffix('.gif')
            animation.write_bytes(data)
            caption = (f'<figcaption>{"<p>" + figure["caption"] + "</p>" if figure.get("caption") else ""}'
                       f'<p><a href="{url[:-4]}.gif">Open the animation</a></p></figcaption>')
        if figure.get('rotation'):
            image = image.rotate(-figure['rotation'], expand=True)
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGBA')
            flat = Image.new('RGB', image.size, 'white')
            flat.paste(image, mask=image.split()[-1])
            image = flat
        else:
            image = image.convert('RGB')
        image.thumbnail((1600, 1600))
        if destination.suffix == '.png':
            image.save(destination, optimize=True)
        else:
            image.save(destination, quality=82, optimize=True, progressive=True)
        self.used_figures.append({'file': figure['file'], 'source': name,
                                  'sha256': hashlib.sha256(data).hexdigest()})
        return (f'<figure class="textbook-figure"><a href="{url}"><img src="{url}" '
                f'alt="{html.escape(figure["alt"], quote=True)}" width="{image.width}" height="{image.height}" '
                f'loading="lazy"></a>{caption}</figure>')

    def table_html(self, block, label):
        rows = block.findall('w:tr', NS)
        out = [f'<div class="textbook-table" role="region" aria-label="{html.escape(label, quote=True)}" tabindex="0">'
               f'<table><caption>{html.escape(label)}</caption>']
        for row_index, row in enumerate(rows):
            if row_index == 0:
                out.append('<thead>')
            elif row_index == 1:
                out.append('<tbody>')
            out.append('<tr>')
            for col_index, cell in enumerate(row.findall('w:tc', NS)):
                span = cell.find('w:tcPr/w:gridSpan', NS)
                colspan = f' colspan="{span.get(W + "val")}"' if span is not None else ''
                tag = 'th' if row_index == 0 or col_index == 0 else 'td'
                scope = ' scope="col"' if row_index == 0 else ' scope="row"' if col_index == 0 else ''
                parts = []
                for p in cell.findall('w:p', NS):
                    content = self.inline(p)
                    for name, figure in self.block_images(p):
                        content += self.figure_html(name, figure)
                    if content:
                        parts.append(content)
                content = '<br>'.join(parts)
                if tag == 'th':
                    content = re.sub(r'</?strong>', '', content)
                out.append(f'<{tag}{scope}{colspan}>{content}</{tag}>')
            out.append('</tr>')
            if row_index == 0:
                out.append('</thead>')
        if len(rows) > 1:
            out.append('</tbody>')
        out.append('</table></div>')
        return ''.join(out)


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        self.parts.append(' ')

    def handle_data(self, data):
        self.parts.append(data)

    def handle_endtag(self, tag):
        self.parts.append(' ')


def heading_ids():
    used = set()

    def make(value):
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()
        base = re.sub(r'[^a-z0-9]+', '-', value).strip('-') or 'section'
        unique, suffix = base, 2
        while unique in used:
            unique, suffix = f'{base}-{suffix}', suffix + 1
        used.add(unique)
        return unique
    return make


def chapter_range(doc, chapter):
    start = next(i for i, b in enumerate(doc.blocks)
                 if doc.heading_level(b) == 1 and text(b).strip() == chapter['sourceHeading'])
    end = next(i for i in range(start + 1, len(doc.blocks))
               if doc.heading_level(doc.blocks[i]) == 1 and re.match(r'^(Chapter |Answers to Review)', text(doc.blocks[i]).strip()))
    return start, end


def section_items(doc, blocks, heading):
    """Paragraphs under an H2 matching heading (to the next H1/H2)."""
    items, active = [], False
    for block in blocks:
        level = doc.heading_level(block)
        if level in (1, 2):
            active = text(block).strip() == heading
            continue
        if active and block.tag == W + 'p' and text(block).strip():
            items.append(block)
    return items


def block_lines(block):
    """Paragraph text split at Word line breaks."""
    value = ''.join('\n' if n.tag == W + 'br' else (n.text or '') if n.tag == W + 't' else '' for n in block.iter())
    return [normalized(v) for v in value.split('\n') if normalized(v)]


def review_and_answers(doc, chapter, blocks):
    """Questions from the chapter list (sub-items join their question) paired
    with the answer key. The key's wording is used: it is the corrected copy."""
    questions = []
    for block in section_items(doc, blocks, 'Review Questions'):
        info = doc.list_info(block)
        if not info:
            continue
        if info[1] > 0 and questions:
            questions[-1].append(normalized(text(block)))
        else:
            questions.append([normalized(text(block))])
    key_start = next(i for i, b in enumerate(doc.blocks) if text(b).strip() == chapter['answerKeyHeading'])
    # Most keys mark each answer with "Answer:"; some (answerStyle "numbered")
    # start each one with its numbered question on its own line instead.
    numbered = chapter.get('answerStyle') == 'numbered'
    answers = []
    for block in doc.blocks[key_start + 1:]:
        value = text(block).strip()
        if doc.heading_level(block) in (1, 2) or re.match(r'^Chapter \d.*Answer Key$', value):
            break
        if not value:
            continue
        if 'Answer:' in value or (numbered and re.match(r'^\d+\.\s', value)):
            answers.append([block])
        elif answers:
            answers[-1].append(block)  # worked steps or a list under the answer
    assert len(questions) == len(answers), f'{len(questions)} questions, {len(answers)} answers'
    result = {}
    for number, (question, blocks_) in enumerate(zip(questions, answers), 1):
        lines = [line for b in blocks_ for line in block_lines(b)]
        joined = '\n'.join(lines)
        if numbered:
            key_question, first = re.sub(r'^\d+\.\s*', '', lines[0]), '\n'.join(lines[1:])
        else:
            key_question, first = joined.split('Answer:', 1)
        key_question = normalized(key_question)
        assert key_question[:12].lower() == question[0][:12].lower(), (number, question[0], key_question)
        if len(question) > 1:
            key_question += ' ' + ', '.join(question[1:]) + '.'
        steps = [normalized(s) for s in first.split('\n') if normalized(s)]
        result[str(number)] = {'question': key_question, 'answer': steps[0] if len(steps) == 1 else steps}
    return result


def skills(doc, blocks):
    return [normalized(text(b)) for b in section_items(doc, blocks, 'Skills Checksheet') if doc.list_info(b)]


def convert(doc, number, chapter, figures):
    start, end = chapter_range(doc, chapter)
    blocks = doc.blocks[start + 1:end]
    converter = Converter(doc, number, chapter, figures)
    make_id = heading_ids()
    out, toc, expected = [], [], []
    stack = []  # open lists: (tag, level)
    skipping = False
    omit = [re.compile(p) for p in chapter['omitSections']]
    skip_text = [re.compile(p) for p in chapter.get('skipParagraphs', [])]
    last_heading = chapter['title']
    tables = 0
    definitions = False
    in_dl = False
    # Sections written to their own HTML fragment (labs with figures),
    # included by a hand-written resource page.
    extracts = {re.compile(k): v for k, v in chapter.get('extracts', {}).items()}
    fragments = {}
    chapter_out, chapter_expected = out, expected
    extracting = False

    def close_lists(to_level=-1):
        nonlocal in_dl
        while stack and stack[-1][1] > to_level:
            out.append(f'</li></{stack.pop()[0]}>')
        if in_dl and to_level < 0:
            out.append('</dl>')
            in_dl = False

    for block in blocks:
        value = text(block).strip()
        level = doc.heading_level(block) if block.tag == W + 'p' else 0
        level = chapter.get('headingLevels', {}).get(value, level) if (level or value in chapter.get('headingLevels', {})) else 0
        if level == 2:
            close_lists()
            target = next((v for k, v in extracts.items() if k.search(value)), None)
            extracting = target is not None
            out = fragments.setdefault(target, []) if extracting else chapter_out
            expected = [] if extracting else chapter_expected
            skipping = not extracting and any(p.search(value) for p in omit)
            if extracting:
                continue
        if skipping:
            continue
        if block.tag == W + 'tbl':
            close_lists()
            cells = list(block.iter(W + 'tc'))
            if all(cell.findall('.//a:blip', NS) or not text(cell).strip() for cell in cells) and any(cell.findall('.//a:blip', NS) for cell in cells):
                # A layout table of pictures (with optional labels): a figure grid.
                out.append('<ul class="parts-grid">')
                for cell in cells:
                    label = normalized(text(cell))
                    for p in cell.findall('w:p', NS):
                        for name, figure in converter.block_images(p):
                            if label:
                                figure = dict(figure, caption=html.escape(label))
                            item = converter.figure_html(name, figure).replace('class="textbook-figure"', 'class="part-card"', 1)
                            out.append(f'<li>{item}</li>')
                out.append('</ul>')
                expected.extend(normalized(text(c)) for c in cells if text(c).strip())
                continue
            tables += 1
            label = chapter.get('tableLabels', {}).get(str(tables), f'{last_heading}')
            out.append(converter.table_html(block, label))
            expected.extend(normalized(text(c)) for c in block.iter(W + 'tc') if text(c).strip())
            continue
        if block.tag != W + 'p':
            continue
        if any(p.search(value) for p in skip_text):
            continue
        if level:
            close_lists()
            tag = 'h2' if level <= 2 else 'h3'
            title = chapter.get('headings', {}).get(value, value)
            if not title:  # heading dropped in favor of a table caption
                expected.append(None)
                continue
            anchor = make_id(title)
            out.append(f'<{tag} id="{anchor}">{html.escape(title)}</{tag}>')
            if not extracting:
                toc.append({'title': ('— ' if tag == 'h3' else '') + title, 'id': anchor})
            last_heading = title
            definitions = value in chapter.get('definitionSections', [])
            expected.append(normalized(title))
            continue
        content = converter.inline(block)
        images = converter.block_images(block)
        listed = doc.list_info(block)
        if content:
            expected.append(normalized(re.sub(r'<[^>]+>', '', content)) if not ('<math' in content) else None)
            if listed:
                tag, depth = listed
                while stack and (stack[-1][1] > depth or (stack[-1][1] == depth and stack[-1][0] != tag)):
                    out.append(f'</li></{stack.pop()[0]}>')
                if stack and stack[-1][1] == depth:
                    out.append('</li><li>')
                else:  # a new list, nested inside the open item if deeper
                    out.append(f'<{tag}><li>')
                    stack.append((tag, depth))
                out.append(content)
            elif definitions and (term := re.match(r'^<strong>(.+?)\s*-?\s*</strong>\s*-?\s*(.+)$', content)):
                if not in_dl:
                    close_lists()
                    out.append('<dl class="key-terms">')
                    in_dl = True
                out.append(f'<dt>{term[1]}</dt><dd>{term[2][0].upper() + term[2][1:]}</dd>')
            else:
                close_lists()
                out.append(f'<p>{content}</p>')
        for name, figure in images:
            close_lists()
            out.append(converter.figure_html(name, figure))
    close_lists()
    out, expected = chapter_out, chapter_expected
    for path, parts in fragments.items():
        fragment = '\n'.join(parts)
        for old, new in chapter.get('extractReplace', []):
            assert old in fragment, f'Chapter {number}: extract correction not found: {old}'
            fragment = fragment.replace(old, new)
        (ROOT / path).parent.mkdir(parents=True, exist_ok=True)
        (ROOT / path).write_text(fragment + '\n')
    if converter.missing:
        raise SystemExit(f'Chapter {number}: no figure entry for {sorted(set(converter.missing))}')
    if chapter.get('closing'):
        out.append(chapter['closing'])
        heading = re.search(r'<h2 id="([^"]+)">([^<]+)</h2>', chapter['closing'])
        if heading:
            toc.append({'title': html.unescape(heading[2]), 'id': heading[1]})
    body = '\n'.join(out)
    for old, new in chapter.get('replace', []):
        assert old in body, f'Chapter {number}: correction not found: {old}'
        body = body.replace(old, new)
    assert '{{' not in body and '{%' not in body, 'Template delimiter in source'
    parser = PlainText()
    parser.feed(body)
    # Compare letters and digits only: tags split words, and definition
    # lists drop the source's term-definition hyphen.
    def squash(value):
        return re.sub(r'[\W_]+', '', value).lower()
    rendered = squash(''.join(parser.parts))
    corrected = [(normalized(re.sub(r'<[^>]+>', ' ', html.unescape(o))), normalized(re.sub(r'<[^>]+>', ' ', html.unescape(n))))
                 for o, n in chapter.get('replace', [])]
    for source_text in filter(None, expected):
        source_text = normalized(html.unescape(source_text))
        for old, new in corrected:
            source_text = source_text.replace(old, new)
        assert squash(source_text) in rendered, f'Chapter {number}: missing text: {source_text[:120]}'
    metadata = {
        'layout': 'layouts/textbook-chapter.njk', 'tags': [], 'eleventyExcludeFromCollections': True,
        'topic': chapter['topic'], 'courseId': chapter['courseId'], 'title': chapter['title'],
        'description': chapter['description'], 'chapterNumber': number,
        'textbookEyebrow': 'REMOTE AND AUTONOMOUS AIRCRAFT SYSTEMS · WEB EDITION',
        'sourceNote': chapter['sourceNote'], 'headerLinks': chapter['headerLinks'], 'toc': toc,
        'permalink': chapter['url']}
    page = ROOT / chapter['output']
    page.parent.mkdir(parents=True, exist_ok=True)
    page.write_text('---\n' + json.dumps(metadata, indent=2, ensure_ascii=False) + '\n---\n' + body + '\n')

    course_file = ROOT / chapter['courseData']
    course = json.loads(course_file.read_text()) if course_file.exists() else {'units': []}
    course['chapterUrl'] = chapter['url']
    course['chapterTitle'] = chapter['title']
    fixes = chapter.get('dataReplace', [])

    def fix(value):
        if isinstance(value, list):
            return [fix(v) for v in value]
        for old, new in fixes:
            value = value.replace(old, new)
        return value
    course['reviewQuestions'] = {k: {f: fix(v) for f, v in item.items()}
                                 for k, item in review_and_answers(doc, chapter, blocks).items()}
    checksheet = [fix(skill) for skill in skills(doc, blocks)]
    if checksheet and course['units']:
        course['units'][-1]['skills'] = checksheet
    course_file.write_text(json.dumps(course, indent=2, ensure_ascii=False) + '\n')
    return {'chapter': number, 'output': chapter['output'], 'tables': tables,
            'images': converter.used_figures, 'verifiedTextBlocks': len(list(filter(None, expected))),
            'reviewQuestions': len(course['reviewQuestions']), 'skills': len(checksheet),
            'htmlSha256': hashlib.sha256(body.encode()).hexdigest()}


def main():
    wanted = sys.argv[1:] or list(CONFIG['chapters'])
    audit_file = ROOT / 'editorial/lab-manual-import.json'
    audit = json.loads(audit_file.read_text()) if audit_file.exists() else {'chapters': {}}
    audit['source'] = CONFIG['source']
    audit['sourceSha256'] = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    with zipfile.ZipFile(SOURCE) as archive:
        doc = Doc(archive)
        doc.rels_by_name = {Path(t).name: t for t in doc.rels.values()}
        for number in wanted:
            result = convert(doc, int(number), CONFIG['chapters'][number], CONFIG['figures'])
            audit['chapters'][number] = result
            print(f"Chapter {number}: {result['verifiedTextBlocks']} text blocks verified, "
                  f"{len(result['images'])} images, {result['tables']} tables, "
                  f"{result['reviewQuestions']} review questions, {result['skills']} skills")
    audit['chapters'] = dict(sorted(audit['chapters'].items(), key=lambda kv: int(kv[0])))
    audit_file.write_text(json.dumps(audit, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    main()
