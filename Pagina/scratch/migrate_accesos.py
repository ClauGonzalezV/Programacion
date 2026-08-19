import os

files = [
    'modelo-501.html',
    'control-acceso-sia.html',
    'biometria.html',
    'tarjetas-claves.html',
    'tag-vehicular.html',
    'sistema-e-lockers.html',
    'gym-app-control.html',
    'condominio-seguro.html',
    'libro-id-access.html',
    'colegios-interactivo.html',
    'vehiculos-transporte.html',
    'control-eventos-clubes.html',
    'citofonia-interfonia.html'
]

src_dir = r'a:\Programacion\Pagina'
dst_dir = r'a:\Programacion\Pagina\accesos-integrados'

for f in files:
    src_path = os.path.join(src_dir, f)
    dst_path = os.path.join(dst_dir, f)
    
    with open(src_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace asset and main nav paths for subfolder depth
    content = content.replace('href="css/styles.css"', 'href="../css/styles.css"')
    content = content.replace('src="js/products-data.js"', 'src="../js/products-data.js"')
    content = content.replace('src="js/app.js"', 'src="../js/app.js"')
    content = content.replace('href="index.html"', 'href="../index.html"')
    content = content.replace('href="index.html#', 'href="../index.html#')
    content = content.replace('href="productos.html"', 'href="../productos.html"')
    content = content.replace('src="img/', 'src="../img/')
    content = content.replace("url('img/", "url('../img/")
    content = content.replace('url("img/', 'url("../img/')
    
    with open(dst_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print('Migrated:', f, 'to accesos-integrados/')

print('SUCCESS!')
