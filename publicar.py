#!/usr/bin/env python3
"""Habilita SEO de produção SOMENTE depois de autorização, dados e fotos validados.
Uso: python publicar.py https://www.dominio-oficial.com.br
Não inventa um domínio; o usuário deve informar o endereço oficial.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime, timezone
from bs4 import BeautifulSoup
ROOT=Path(__file__).parent
if len(sys.argv) != 2:
    print('Uso: python publicar.py https://www.DOMINIO-OFICIAL.com.br')
    sys.exit(2)
base=sys.argv[1].strip().rstrip('/')
p=urlparse(base)
if p.scheme!='https' or not p.netloc or '.' not in p.netloc or p.path not in ('','/'):
    print('Informe a URL completa HTTPS da raiz do domínio oficial, sem caminho.')
    sys.exit(2)
confirm=input(f'Você possui autorização para publicar oficialmente em {base}, revisou as fotos, horários, privacidade e textos? Escreva PUBLICAR para continuar: ')
if confirm != 'PUBLICAR':
    print('Operação cancelada. A prévia continua protegida por noindex.')
    sys.exit(1)
for fname in ('index.html','privacidade.html'):
    filepath=ROOT/fname
    soup=BeautifulSoup(filepath.read_text('utf-8'),'html.parser')
    robots=soup.find('meta',attrs={'name':'robots'})
    if robots: robots['content']='index,follow,max-image-preview:large' if fname=='index.html' else 'noindex,follow'
    canon=soup.find('link',attrs={'rel':'canonical'})
    if not canon:
        canon=soup.new_tag('link', rel='canonical')
        soup.head.append(canon)
    canon['href']=f'{base}/'+('' if fname=='index.html' else fname)
    if fname=='index.html':
        for meta_name,meta_value in [('og:url',f'{base}/'),('og:image',f'{base}/assets/og-demonstracao.jpg')]:
            meta=soup.find('meta',attrs={'property':meta_name})
            if not meta:
                meta=soup.new_tag('meta');meta['property']=meta_name;soup.head.append(meta)
            meta['content']=meta_value
        # URL in schema is set only after official domain exists.
        schema=soup.find('script',id='organization-schema')
        if schema and schema.string:
            import json
            content=json.loads(schema.string)
            content['url']=base+'/'
            schema.string=json.dumps(content,ensure_ascii=False,indent=2)
    filepath.write_text(str(soup),encoding='utf-8')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+base+'/sitemap.xml\n',encoding='utf-8')
lastmod=datetime.now(timezone.utc).strftime('%Y-%m-%d')
(ROOT/'sitemap.xml').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <url><loc>{base}/</loc><lastmod>{lastmod}</lastmod></url>
</urlset>
''',encoding='utf-8')
print('Arquivos SEO prontos para produção. Ainda é necessário configurar Search Console, Política de Privacidade oficial e fotos autorizadas.')
