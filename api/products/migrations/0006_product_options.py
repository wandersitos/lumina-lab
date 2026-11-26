from django.db import migrations, models
import django.db.models.deletion


def seed_product_options(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    ProductOptionGroup = apps.get_model('products', 'ProductOptionGroup')
    ProductOption = apps.get_model('products', 'ProductOption')
    ProductOptionAssignment = apps.get_model('products', 'ProductOptionAssignment')

    conexion_group, _ = ProductOptionGroup.objects.get_or_create(
        slug='conexion',
        defaults={'name': 'Conexión', 'order': 1, 'is_active': True},
    )
    ProductOptionGroup.objects.get_or_create(
        slug='tamano',
        defaults={'name': 'Tamaño', 'order': 2, 'is_active': True},
    )

    opt_inalambrica, _ = ProductOption.objects.get_or_create(
        group=conexion_group,
        slug='inalambrica',
        defaults={
            'name': 'Inalámbrica',
            'price_delta': 0,
            'is_visible': True,
            'in_stock': True,
            'order': 1,
        },
    )
    opt_con_cable, _ = ProductOption.objects.get_or_create(
        group=conexion_group,
        slug='con-cable',
        defaults={
            'name': 'Con cable',
            'price_delta': 0,
            'is_visible': True,
            'in_stock': True,
            'order': 2,
        },
    )

    for product in Product.objects.all():
        ProductOptionAssignment.objects.get_or_create(
            product=product,
            option=opt_inalambrica,
            defaults={'is_visible': True, 'in_stock': True},
        )
        ProductOptionAssignment.objects.get_or_create(
            product=product,
            option=opt_con_cable,
            defaults={'is_visible': True, 'in_stock': True},
        )


def unseed_product_options(apps, schema_editor):
    ProductOptionGroup = apps.get_model('products', 'ProductOptionGroup')
    ProductOptionGroup.objects.filter(slug__in=['conexion', 'tamano']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_content'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductOptionGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('order', models.IntegerField(default=0, verbose_name='Orden')),
                ('is_active', models.BooleanField(default=True, verbose_name='Activo')),
            ],
            options={
                'verbose_name': 'Grupo de opciones',
                'verbose_name_plural': 'Grupos de opciones',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='ProductOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('slug', models.SlugField(max_length=100)),
                ('price_delta', models.IntegerField(default=0, verbose_name='Variación de precio (COP)')),
                ('is_visible', models.BooleanField(default=True, verbose_name='Visible')),
                ('in_stock', models.BooleanField(default=True, verbose_name='Disponible')),
                ('order', models.IntegerField(default=0, verbose_name='Orden')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='products.productoptiongroup', verbose_name='Grupo')),
            ],
            options={
                'verbose_name': 'Opción de producto',
                'verbose_name_plural': 'Opciones de producto',
                'ordering': ['order', 'id'],
                'unique_together': {('group', 'slug')},
            },
        ),
        migrations.CreateModel(
            name='ProductOptionAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_visible', models.BooleanField(default=True, verbose_name='Visible en este producto')),
                ('in_stock', models.BooleanField(default=True, verbose_name='Disponible en este producto')),
                ('price_delta_override', models.IntegerField(blank=True, null=True, verbose_name='Variación de precio específica (COP)')),
                ('option', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='product_assignments', to='products.productoption', verbose_name='Opción')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='option_assignments', to='products.product', verbose_name='Producto')),
            ],
            options={
                'verbose_name': 'Asignación de opción',
                'verbose_name_plural': 'Asignaciones de opciones',
                'ordering': ['option__group__order', 'option__order', 'id'],
                'unique_together': {('product', 'option')},
            },
        ),
        migrations.RunPython(seed_product_options, unseed_product_options),
    ]
