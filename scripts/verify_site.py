import os
import re
import glob
import json

html_files = [
    'index.html', 'about.html', 'products.html', 'recipes.html',
    'team.html', 'gallery.html', 'contact.html', 'inquiries.html', 'owner-login.html'
]

errors = []
warnings = []

print("=== SUBHADARSHINI SPICES SITE AUDIT ===")

# 1. Check HTML Pages
print("\n[1] Checking HTML pages & scripts...")
for h in html_files:
    if not os.path.exists(h):
        errors.append(f"Missing HTML file: {h}")
        continue
    with open(h, 'r', encoding='utf-8') as f:
        content = f.read()

    has_style = 'assets/css/style.css' in content
    has_main = 'assets/js/main.js' in content or h in ['inquiries.html', 'owner-login.html']
    has_favicon = 'assets/images/logo/logo.png' in content
    
    print(f"  OK: {h:17} | CSS: {has_style} | MainJS: {has_main} | Icon: {has_favicon}")

    # Check images referenced in HTML
    images = re.findall(r'src=["\']([^"\'\s>]+)["\']', content)
    for img in images:
        if img.startswith(('http://', 'https://', 'data:', '//')):
            continue
        clean = img.split('?')[0].split('#')[0]
        if not os.path.exists(clean):
            errors.append(f"Missing image in {h}: {img}")

    # Check internal links
    links = re.findall(r'href=["\']([^"\'\s>]+)["\']', content)
    for l in links:
        if l.startswith(('http://', 'https://', 'tel:', 'mailto:', '#', 'data:')) or l == '':
            continue
        clean_link = l.split('?')[0].split('#')[0]
        if clean_link and not os.path.exists(clean_link):
            errors.append(f"Broken link in {h}: {l}")

# 2. Check Product Catalog Data
print("\n[2] Checking products-data.js...")
if os.path.exists('assets/js/products-data.js'):
    with open('assets/js/products-data.js', 'r', encoding='utf-8') as f:
        js = f.read()
    p_imgs = re.findall(r'image:\s*["\']([^"\']+)["\']', js)
    print(f"  Found {len(p_imgs)} product images in catalog")
    for img in p_imgs:
        clean = img.split('?')[0]
        if not os.path.exists(clean):
            errors.append(f"Missing product catalog image: {img}")
else:
    errors.append("assets/js/products-data.js is missing!")

# 3. Check CSS Images
print("\n[3] Checking CSS assets...")
if os.path.exists('assets/css/style.css'):
    with open('assets/css/style.css', 'r', encoding='utf-8') as f:
        css = f.read()
    css_urls = re.findall(r'url\(["\']?([^"\'\)]+)["\']?\)', css)
    for u in css_urls:
        if u.startswith(('http://', 'https://', 'data:')):
            continue
        clean_u = u.split('?')[0].split('#')[0]
        resolved = os.path.normpath(os.path.join('assets/css', clean_u))
        if not os.path.exists(resolved):
            errors.append(f"Missing CSS background asset: {u} (resolved to {resolved})")
    print(f"  CSS parsed, {len(css_urls)} url() references verified.")
else:
    errors.append("assets/css/style.css is missing!")

# 4. Check Data Files
print("\n[4] Checking JSON data stores...")
for jf in glob.glob('data/*.json'):
    try:
        with open(jf, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"  OK: {jf} is valid JSON ({len(data)} items/keys)")
    except Exception as e:
        errors.append(f"Invalid JSON in {jf}: {e}")

# 5. Summary
print("\n=== AUDIT RESULTS ===")
if errors:
    print(f"FAILED: Found {len(errors)} error(s):")
    for e in errors:
        print(f"  [!] {e}")
else:
    print("SUCCESS: 0 errors found! All assets, pages, catalog items, and data files are intact.")

