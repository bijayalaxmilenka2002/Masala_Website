import os
import re

html_files = ['index.html', 'about.html', 'products.html', 'recipes.html', 'team.html', 'gallery.html', 'contact.html']

for h in html_files:
    if not os.path.exists(h):
        print('MISSING:', h)
        continue
    with open(h, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_products_data = 'products-data.js' in content
    has_main_js = 'main.js' in content
    has_cart_drawer = 'id="cartDrawer"' in content
    has_checkout_modal = 'id="checkoutModal"' in content
    has_btn_cart = 'btn-cart' in content
    
    print(f"[{h:14}] CartBtn: {str(has_btn_cart):5} | Drawer: {str(has_cart_drawer):5} | Checkout: {str(has_checkout_modal):5} | ProductsData: {str(has_products_data):5} | MainJS: {str(has_main_js):5}")
    
    # Check images referenced in HTML
    images = re.findall(r'src=["\'](assets/images/[^"\'\s>]+)["\']', content)
    missing_imgs = [img for img in images if not os.path.exists(img.split('?')[0])]
    if missing_imgs:
        print(f"  Missing images in {h}: {missing_imgs}")

print("\nValidation complete.")
