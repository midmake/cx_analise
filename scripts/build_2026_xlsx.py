#!/usr/bin/env python3
import json, re, zipfile
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring, register_namespace

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'downloads' / 'ANALISE_MERCADO_CLUBES_2026.xlsx'
OUT.parent.mkdir(parents=True, exist_ok=True)

BASE_FILES = [ROOT / 'data' / f'records-{i}.js' for i in range(1, 7)]
CURRENT_FILES = [ROOT / 'data' / f'current-2026-part{i}.js' for i in range(1, 7)]


def read_rows(path):
    if not path.exists():
        return []
    text = path.read_text(encoding='utf-8')
    m = re.search(r'window\.__addMarketRows\((\[.*\])\);', text, re.S)
    return json.loads(m.group(1)) if m else []


def norm_club(name):
    if name == 'Grêmio Náutico Gaúcho':
        return 'GNG'
    if name == 'Professor Gaúcho':
        return 'Gaúcho (CPG)'
    return name


def numeric(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def valid_current(row):
    if int(row[0]) != 2026 or not numeric(row[7]):
        return False
    status = str(row[8] or '').upper()
    return not any(x in status for x in ('DESATUALIZADO','NÃO LOCALIZADO','NECESSITA','A CONFIRMAR'))


def load_current_rows():
    base = []
    for path in BASE_FILES:
        base.extend(read_rows(path))
    fresh = []
    for path in CURRENT_FILES:
        fresh.extend(read_rows(path))

    fresh_pairs = {(norm_club(r[1]), r[2]) for r in fresh}
    fresh_volley_clubs = {norm_club(r[1]) for r in fresh if 'Vôlei' in str(r[2])}

    kept = []
    for r in base:
        if not valid_current(r):
            continue
        club = norm_club(r[1])
        modality = r[2]
        if club in fresh_volley_clubs and 'Vôlei' in str(modality):
            continue
        if (club, modality) in fresh_pairs:
            continue
        rr = list(r)
        rr[1] = club
        kept.append(rr)

    for r in fresh:
        if valid_current(r):
            rr = list(r)
            rr[1] = norm_club(rr[1])
            kept.append(rr)

    seen = set()
    out = []
    for r in kept:
        key = (r[1], r[2], r[4], r[5], r[6], r[7])
        if key not in seen:
            seen.add(key)
            out.append(r)
    return sorted(out, key=lambda r: (str(r[1]), str(r[2]), str(r[5]), str(r[6]), str(r[4]), float(r[7])))


NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
register_namespace('', NS)


def col_letter(n):
    s = ''
    while n:
        n, rem = divmod(n - 1, 26)
        s = chr(65 + rem) + s
    return s


def sheet_xml(rows):
    ws = Element(f'{{{NS}}}worksheet')
    cols = SubElement(ws, f'{{{NS}}}cols')
    for idx, width in enumerate([26,24,18,40,18,16], 1):
        SubElement(cols, f'{{{NS}}}col', min=str(idx), max=str(idx), width=str(width), customWidth='1')
    data = SubElement(ws, f'{{{NS}}}sheetData')
    for ri, values in enumerate(rows, 1):
        row = SubElement(data, f'{{{NS}}}row', r=str(ri))
        for ci, value in enumerate(values, 1):
            ref = f'{col_letter(ci)}{ri}'
            style = '1' if ri == 1 else ('2' if ci == 6 and numeric(value) else '0')
            if numeric(value):
                c = SubElement(row, f'{{{NS}}}c', r=ref, s=style)
                SubElement(c, f'{{{NS}}}v').text = str(value)
            else:
                c = SubElement(row, f'{{{NS}}}c', r=ref, s=style, t='inlineStr')
                isel = SubElement(c, f'{{{NS}}}is')
                SubElement(isel, f'{{{NS}}}t').text = '' if value is None else str(value)
    SubElement(ws, f'{{{NS}}}autoFilter', ref=f'A1:F{len(rows)}')
    return b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + tostring(ws, encoding='utf-8')


def styles_xml():
    return b'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="R$ #,##0.00"/></numFmts>
<fonts count="2"><font><sz val="10"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Aptos"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF17365D"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''


def build():
    current = load_current_rows()
    headers = ['Clube','Modalidade','Público','Plano / Categoria','Frequência','Valor (R$)']
    rows = [headers] + [[r[1], r[2], r[5] or 'Público geral', r[4] or '', r[6] or 'Não informado', r[7]] for r in current]

    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''
    root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'''
    workbook = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="VALORES 2026" sheetId="1" r:id="rId1"/></sheets></workbook>'''
    wb_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'''

    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', root_rels)
        z.writestr('xl/workbook.xml', workbook)
        z.writestr('xl/_rels/workbook.xml.rels', wb_rels)
        z.writestr('xl/styles.xml', styles_xml())
        z.writestr('xl/worksheets/sheet1.xml', sheet_xml(rows))
    print(f'Generated {OUT} with {len(current)} current rows')


if __name__ == '__main__':
    build()
