from django.contrib import admin, messages
from django.shortcuts import render, redirect
from django.urls import path, reverse
from .models import Product
from .importer import CatalogImporter


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'price', 'dimensions', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'importar/',
                self.admin_site.admin_view(self.import_catalog_view),
                name='products_product_import'
            ),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        if hasattr(response, 'render') and callable(response.render):
            response.render()
            import_url = reverse('admin:products_product_import')
            btn_html = (
                f'<li><a href="{import_url}" class="historylink" style="background: #2563eb; color: white; font-weight: bold; padding: 5px 12px; border-radius: 4px;">'
                f'Subir catálogo masivo / Importar</a></li>'
            )
            content = response.content.decode('utf-8')
            if '<ul class="object-tools">' in content:
                content = content.replace('<ul class="object-tools">', f'<ul class="object-tools">{btn_html}', 1)
            elif '</ul>' in content:
                content = content.replace('</ul>', f'{btn_html}</ul>', 1)
            response.content = content.encode('utf-8')
        return response

    def import_catalog_view(self, request):
        if request.method == 'POST':
            catalog_file = request.FILES.get('catalog_file')
            if not catalog_file:
                messages.error(request, "Por favor seleccione un archivo para importar.")
                return redirect('admin:products_product_import')

            importer = CatalogImporter()
            result = importer.import_file(catalog_file, filename=catalog_file.name)

            if result['created'] > 0 or result['updated'] > 0:
                messages.success(
                    request,
                    f"{result['created'] + result['updated']} productos importados/actualizados correctamente "
                    f"({result['created']} creados, {result['updated']} actualizados)."
                )

            if result['errors']:
                if result['created'] == 0 and result['updated'] == 0:
                    messages.error(
                        request,
                        f"Error en la importación: {result['errors'][0]}"
                    )
                else:
                    messages.warning(
                        request,
                        f"Se registraron {len(result['errors'])} advertencia(s)/error(es). Primer error: {result['errors'][0]}"
                    )

            return redirect('admin:products_product_changelist')

        context = {
            **self.admin_site.each_context(request),
            'title': 'Subir catálogo masivo de productos',
            'opts': self.model._meta,
        }
        return render(request, 'admin/products/product/import_catalog.html', context)
