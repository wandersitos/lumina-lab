from django.db import migrations

def create_initial_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    products_data = [
        {
            'name': 'Lámpara Vórtice',
            'slug': 'lampara-vortice',
            'description': 'Diseño helicoidal orgánico con entramado geométrico que difumina la luz suavemente en 360 grados. Fabricada mediante impresión 3D aditiva de alta precisión.',
            'price': 120000,
            'dimensions': '24 x 16 cm',
            'image_url': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
            'colors': ['Blanco Cálido', 'Terracota', 'Verde Salvia', 'Negro Mate'],
            'is_active': True,
        },
        {
            'name': 'Lámpara Eclipse',
            'slug': 'lampara-eclipse',
            'description': 'Estructura minimalista de doble anillo con halo de luz indirecta de acento arquitectónico contemporáneo.',
            'price': 145000,
            'dimensions': '28 x 20 cm',
            'image_url': 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
            'colors': ['Blanco Cálido', 'Terracota', 'Gris Ceniza'],
            'is_active': True,
        },
        {
            'name': 'Lámpara Aurora',
            'slug': 'lampara-aurora',
            'description': 'Silueta fluida con curvas biomórficas inspiradas en ondas de luz nórdicas, ideal para mesas de noche y espacios cálidos.',
            'price': 95000,
            'dimensions': '18 x 12 cm',
            'image_url': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
            'colors': ['Blanco Cálido', 'Verde Salvia', 'Ocre Cálido'],
            'is_active': True,
        },
    ]

    for p in products_data:
        Product.objects.get_or_create(slug=p['slug'], defaults=p)

def remove_initial_products(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    Product.objects.filter(slug__in=['lampara-vortice', 'lampara-eclipse', 'lampara-aurora']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_products, remove_initial_products),
    ]
