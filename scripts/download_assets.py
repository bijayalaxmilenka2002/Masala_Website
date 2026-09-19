import os
import urllib.request
import urllib.parse

BASE_URL = "https://www.subhadarshini.com"

ASSETS = {
    "assets/images/logo": [
        ("logo.png", "/assets/images/logo/logo.png")
    ],
    "assets/images/banner": [
        ("banner1.jpg", "/assets/images/banner/banner1.jpg"),
        ("banner2.jpg", "/assets/images/banner/banner2.jpg"),
    ],
    "assets/images/about": [
        ("about.png", "/assets/images/about/about.png"),
        ("work-process.png", "/assets/images/about/work-proces.png"),
        ("contact-img.jpg", "/assets/images/subh-contact-img.jpg")
    ],
    "assets/images/team": [
        ("saini-subhadarshini.png", "/assets/images/team/Saini%20Subhadarsini.png"),
        ("amit-swain.png", "/assets/images/team/Amit%20Kumar%20Swain.png"),
        ("ashok-nayak.png", "/assets/images/team/Ashok%20Nayak.png"),
        ("hitesh-mishra.png", "/assets/images/team/hitesh%20mishra.png"),
        ("prashant-jena.png", "/assets/images/team/peasant%20jena.png"),
    ],
    "assets/images/gallery": [
        ("img1.jpg", "/assets/images/img1.jpg"),
        ("img2.jpg", "/assets/images/img2.jpg"),
        ("client1.jpg", "/assets/images/clients/01.jpg"),
        ("client2.jpg", "/assets/images/clients/02.jpg"),
        ("client3.jpg", "/assets/images/clients/03.jpg"),
    ],
    "assets/images/products": [
        ("sambar-masala.png", "/admin/assets/upload/1852132731_sambarmasala.png"),
        ("fish-curry-masala.png", "/admin/assets/upload/736558991_FishR.png"),
        ("egg-curry-masala.png", "/admin/assets/upload/1637601227_eggcurry.png"),
        ("meat-masala.png", "/admin/assets/upload/887675507_MeatM.png"),
        ("chicken-masala.png", "/admin/assets/upload/1479501800_ChikenMasalaR.png"),
        ("shahi-paneer-masala.png", "/admin/assets/upload/1790375421_Sahipaneer.png"),
        ("chat-masala.png", "/admin/assets/upload/1128579914_chatmasala.png"),
        ("chana-masala.png", "/admin/assets/upload/742235628_ChhanaR.png"),
        ("biryani-masala.png", "/admin/assets/upload/1949616843_BiriyaniMasala.png"),
        ("jaljeera-powder.webp", "/admin/assets/upload/2054785449_natural-jaljeera-powder-1000x1000.webp"),
        ("curry-powder.png", "/admin/assets/upload/437292353_Currypowder.png"),
        ("dalma-powder.png", "/admin/assets/upload/1680127328_pngtree-on-a-white-background-fresh-coriander-coriander-seeds-and-powdered-png-image_11177829.png"),
        ("kitchen-king.webp", "/admin/assets/upload/816220127_Kitchen-King.webp"),
        ("garam-masala.png", "/admin/assets/upload/1559088010_ChikenMasalaR.png"),
        ("black-pepper-powder.png", "/admin/assets/upload/760138810_BlackPepper.png"),
        ("coriander-powder.png", "/admin/assets/upload/1967719139_Coriander.png"),
        ("cumin-powder.png", "/admin/assets/upload/87894778_Cumin.png"),
        ("kashmiri-chilli.png", "/admin/assets/upload/493397207_1062524840_PRODUCTBOX.png"),
        ("red-chilli-powder.png", "/admin/assets/upload/2002564966_760138810_BlackPepper.png"),
        ("turmeric-powder.png", "/admin/assets/upload/80049724_Turmeric.png"),
        ("bay-leaf.png", "/admin/assets/upload/1187692261_TejPatta.png"),
        ("dry-red-chilli.png", "/admin/assets/upload/67135708_RedChilli.png"),
        ("coriander-seeds.png", "/admin/assets/upload/889726963_CorianderSeeds.png"),
        ("panch-phoran.png", "/admin/assets/upload/1407162837_PanchaPhoran.png"),
        ("mustard-seeds.png", "/admin/assets/upload/1482470078_MustardSeeds.png"),
        ("cumin-seeds.png", "/admin/assets/upload/710785626_CuminSeeds.png"),
        ("soya-chunks.png", "/admin/assets/upload/540062252_SoyaChunks.png"),
        ("hing.png", "/admin/assets/upload/1645166611_Hing25g.png"),
        ("dalia.png", "/admin/assets/upload/2097587208_Daliya.png"),
        ("black-salt.png", "/admin/assets/upload/1230798229_Blacksalt.png"),
        ("edible-soda.png", "/admin/assets/upload/1788891266_EdibleSoda.png"),
        ("cornflour.png", "/admin/assets/upload/112990000_CornFlour1kg1.png"),
        ("kasuri-methi.png", "/admin/assets/upload/1074746451_KeshariMethi.png"),
        ("punjabi-dal-tadka.png", "/admin/assets/upload/2063029771_PanjabiDalTadka.png"),
        ("sattu-powder.jpg", "/admin/assets/upload/1561653758_WhatsAppImage2025-10-28at12.07.21_975a79b5.jpg")
    ]
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

for folder, files in ASSETS.items():
    os.makedirs(folder, exist_ok=True)
    for filename, rel_url in files:
        target_path = os.path.join(folder, filename)
        if os.path.exists(target_path) and os.path.getsize(target_path) > 500:
            print(f"Skipping existing: {filename}")
            continue
        
        full_url = BASE_URL + rel_url
        try:
            req = urllib.request.Request(full_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response, open(target_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Downloaded: {filename} ({os.path.getsize(target_path)} bytes)")
        except Exception as e:
            print(f"Failed to download {filename} from {full_url}: {e}")

print("\nAsset download complete!")
