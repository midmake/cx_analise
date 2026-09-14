#!/usr/bin/env python3
import json, re, zipfile
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring, register_namespace

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'downloads' / 'ANALISE_MERCADO_CLUBES_2026.xlsx'
OUT.parent.mkdir(parents=True, exist_ok=True)

RECORD_FILES = [ROOT / 'data' / f'records-{i}.js' for i in range(1, 7)] + [ROOT / 'data' / 'records-raia-2026.js']


def load_rows():
    rows = []
    for path in RECORD_FILES:
        if not path.exists():
            continue
        text = path.read_text(encoding='utf-8')
        m = re.search(r'window\.__addMarketRows\((\[.*\])\);', text, re.S)
        if m:
            rows.extend(json.loads(m.group(1)))
    return [r for r in rows if int(r[0]) == 2026]


def load_contacts():
    text = (ROOT / 'data' / 'bootstrap.js').read_text(encoding='utf-8')
    m = re.search(r'window\.DASHBOARD_DATA=(\{.*?\});\s*window\.__addMarketRows', text, re.S)
    if not m:
        return []
    return json.loads(m.group(1)).get('contacts', [])


def normalized_status(row):
    club, value, status, source = row[1], row[7], str(row[8] or ''), str(row[9] or '')
    upper = status.upper()
    if club == 'Caixeiros Viajantes' and isinstance(value, (int, float)):
        return 'CONFIRMADO ATUAL'
    if club == 'Recreio da Juventude' and isinstance(value, (int, float)) and 'recreiodajuventude.com.br' in source:
        return 'CONFIRMADO ATUAL'
    if club == 'ACM' and isinstance(value, (int, float)) and 'acm-rs.com.br' in source:
        return 'CONFIRMADO ATUAL'
    if club == 'GNG' and isinstance(value, (int, float)) and 'gngaucho.com.br' in source and 'DESATUALIZADO' not in upper:
        return 'CONFIRMADO ATUAL'
    return status


def prepare_rows(raw):
    # Com retorno direto da Raia Center, os placeholders vazios de Natação/Hidro deixam de ser necessários.
    out = []
    for r in raw:
        if r[1] == 'Raia Center' and r[2] in ('Escola de Natação', 'Hidroginástica') and not isinstance(r[7], (int, float)):
            continue
        rr = list(r)
        rr[8] = normalized_status(rr)
        if 'DESATUALIZADO' in str(rr[8]).upper():
            rr[7] = None
        out.append(rr)
    return out


HEADERS = ['Clube','Papel','Tipo','Categoria / plano','Público','Frequência','Mensalidade','Taxa / adesão','Vigência / atualização','Status','Observação','Fonte']


def row_to_excel(r):
    club, modality, typ, category, audience, freq, value, status, source = r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]
    role = 'Referência interna' if club == 'Caixeiros Viajantes' else 'Concorrente'
    fee = None
    vigencia = 'Levantamento atual — Arquivo 2026'
    obs = ''
    if club == 'Raia Center' and isinstance(value, (int, float)) and 'Zona Norte' in str(category):
        fee = 65
        vigencia = 'Retorno direto via WhatsApp — 09/09/2026'
        obs = 'Zona Norte. Valores informados para Natação ou Hidro. Desconto: dinheiro 10%; cheque 6%. Não generalizar para outras unidades sem confirmação.'
    return [club, role, typ or '', category or '', audience or '', freq or '', value, fee, vigencia, status or '', obs, source or '']


def patch_contacts(contacts):
    for c in contacts:
        if str(c.get('Clube','')).upper() == 'RAIA CENTER':
            c['Itens a confirmar'] = 'Equipe de natação; vôlei'
            c['O que falta'] = 'Natação e hidro da Zona Norte confirmadas via WhatsApp em 09/09/2026. Falta confirmar equipe competitiva de natação e aulas/equipe de vôlei; validar se a mesma tabela vale nas demais unidades.'
            c['Andamento'] = 'Parcial — aquáticos confirmados (ZN)'
    return contacts


NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
register_namespace('', NS)


def col_letter(n):
    s = ''
    while n:
        n, rem = divmod(n-1, 26)
        s = chr(65+rem) + s
    return s


def sheet_xml(rows, widths=None, money_cols=None):
    money_cols = set(money_cols or [])
    ws = Element(f'{{{NS}}}worksheet')
    if widths:
        cols = SubElement(ws, f'{{{NS}}}cols')
        for idx, width in enumerate(widths, 1):
            SubElement(cols, f'{{{NS}}}col', min=str(idx), max=str(idx), width=str(width), customWidth='1')
    data = SubElement(ws, f'{{{NS}}}sheetData')
    for ri, values in enumerate(rows, 1):
        row = SubElement(data, f'{{{NS}}}row', r=str(ri))
        for ci, value in enumerate(values, 1):
            ref = f'{col_letter(ci)}{ri}'
            style = '1' if ri == 1 else ('2' if ci in money_cols and isinstance(value, (int,float)) else '0')
            if isinstance(value, (int, float)):
                c = SubElement(row, f'{{{NS}}}c', r=ref, s=style)
                SubElement(c, f'{{{NS}}}v').text = str(value)
            else:
                c = SubElement(row, f'{{{NS}}}c', r=ref, s=style, t='inlineStr')
                isel = SubElement(c, f'{{{NS}}}is')
                t = SubElement(isel, f'{{{NS}}}t')
                t.text = '' if value is None else str(value)
    if rows and rows[0]:
        SubElement(ws, f'{{{NS}}}autoFilter', ref=f'A1:{col_letter(len(rows[0]))}{len(rows)}')
        SubElement(ws, f'{{{NS}}}sheetViews')
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
    raw = prepare_rows(load_rows())
    contacts = patch_contacts(load_contacts())
    mapping = [
        ('ESCOLA NATACAO', 'Escola de Natação'),
        ('EQUIPE NATACAO', 'Equipe de Natação'),
        ('HIDROGINASTICA', 'Hidroginástica'),
        ('VOLEI', 'Vôlei'),
    ]
    sheets = []
    widths = [24,18,20,34,18,14,15,15,28,28,62,58]
    for name, modality in mapping:
        body = [row_to_excel(r) for r in raw if r[2] == modality]
        sheets.append((name, [HEADERS] + body, widths, {7,8}))

    contact_headers = ['Prioridade','Clube','Itens a confirmar','O que falta','Telefone','WhatsApp','E-mail','Site / formulário','Andamento']
    contact_rows = [contact_headers] + [[c.get(h,'') for h in contact_headers] for c in contacts]
    sheets.append(('PRECISA CONTATO', contact_rows, [12,24,38,70,24,34,42,60,30], set()))

    seen = set(); source_rows = [['Clube','Modalidade','Categoria / plano','Status','Fonte']]
    for r in raw:
        source = r[9] or ''
        key = (r[1], r[2], r[4], r[8], source)
        if source and key not in seen:
            seen.add(key)
            source_rows.append([r[1], r[2], r[4] or '', r[8] or '', source])
    sheets.append(('FONTES', source_rows, [24,24,38,30,70], set()))

    confirmed = sum(1 for r in raw if isinstance(r[7], (int,float)) and 'CONFIRMADO ATUAL' in str(r[8]).upper())
    pending = sum(1 for r in raw if not isinstance(r[7], (int,float)))
    summary_rows = [
        ['ARQUIVO 2026 — LEVANTAMENTO ATUAL',''],
        ['Regra de ano','Arquivo 2026 reúne as mensalidades atuais usadas no levantamento, exibidas no dashboard como ano da mensalidade 2025.'],
        ['Registros atuais confirmados', confirmed],
        ['Registros sem valor numérico', pending],
        ['Raia Center — atualização','Zona Norte: Natação/Hidro confirmadas via WhatsApp em 09/09/2026. 1x, 2x, 3x e 5x; planos anual, semestral e mensal; taxa de adesão R$ 65; dinheiro 10% desconto; cheque 6% desconto.'],
        ['Responsável','Rafael Bortolin — Assistente Administrativo'],
    ]
    sheets.append(('RESUMO 2026', summary_rows, [34,100], set()))

    content_types = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>']
    for i in range(1, len(sheets)+1):
        content_types.append(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
    content_types.append('</Types>')

    workbook = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>']
    for i, (name, *_rest) in enumerate(sheets, 1):
        workbook.append(f'<sheet name="{name}" sheetId="{i}" r:id="rId{i}"/>')
    workbook.append('</sheets></workbook>')

    wb_rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">']
    for i in range(1, len(sheets)+1):
        wb_rels.append(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>')
    wb_rels.append(f'<Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    wb_rels.append('</Relationships>')

    root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'''

    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', ''.join(content_types))
        z.writestr('_rels/.rels', root_rels)
        z.writestr('xl/workbook.xml', ''.join(workbook))
        z.writestr('xl/_rels/workbook.xml.rels', ''.join(wb_rels))
        z.writestr('xl/styles.xml', styles_xml())
        for i, (_name, rows, widths_i, money_cols) in enumerate(sheets, 1):
            z.writestr(f'xl/worksheets/sheet{i}.xml', sheet_xml(rows, widths_i, money_cols))
    print(f'Generated {OUT}')


if __name__ == '__main__':
    build()
