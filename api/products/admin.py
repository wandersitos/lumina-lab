from django.contrib import admin, messages
from django.shortcuts import render, redirect
from django.urls import path, reverse
from django.http import JsonResponse
from django.utils.html import mark_safe
from .models import Product
from .importer import CatalogImporter


def get_resolved_image_list(obj):
    """
    Devuelve la lista de URLs completas para todas las imágenes del producto,
    resolviendo rutas relativas a sus URLs de Cloudinary si existen.
    """
    if not obj:
        return []

    images_raw = obj.images if isinstance(obj.images, list) else []

    # Determinar el directorio base de Cloudinary
    base_cloudinary_dir = ""
    candidate = obj.image_url or ""
    if candidate.startswith('http') and '/' in candidate:
        base_cloudinary_dir = candidate.rsplit('/', 1)[0] + '/'

    resolved = []
    # Incluir la image_url actual al inicio
    if obj.image_url:
        resolved.append(obj.image_url)

    for img in images_raw:
        if not img or not isinstance(img, str):
            continue
        if img.startswith('http'):
            resolved.append(img)
        elif base_cloudinary_dir:
            filename = img.rsplit('/', 1)[-1]
            resolved.append(base_cloudinary_dir + filename)
        else:
            resolved.append(img)

    # Eliminar duplicados preservando el orden
    seen = set()
    unique_list = []
    for url in resolved:
        if url not in seen:
            seen.add(url)
            unique_list.append(url)

    return unique_list


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('foto_portada', 'name', 'slug', 'price', 'dimensions', 'is_active', 'created_at')
    list_filter = ('collection', 'category', 'in_stock', 'is_active')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('selector_de_portada',)

    fields = (
        'name',
        'slug',
        'price',
        'collection',
        'category',
        'in_stock',
        'is_active',
        'dimensions',
        'material',
        'order',
        'selector_de_portada',
        'image_url',
        'images',
        'description',
    )

    @admin.display(description="Portada")
    def foto_portada(self, obj):
        if not obj or not obj.image_url:
            return mark_safe('<span style="color: #999; font-size: 11px;">Sin foto</span>')

        fallback = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=120&q=80'
        return mark_safe(
            f'<div style="width: 48px; height: 48px; border-radius: 6px; overflow: hidden; background: #1e293b; border: 1px solid #475569; display: flex; align-items: center; justify-content: center;">'
            f'<img src="{obj.image_url}" '
            f'onerror="this.onerror=null; this.src=\'{fallback}\';" '
            f'style="width: 100%; height: 100%; object-fit: cover; display: block;" '
            f'title="{obj.name}" />'
            f'</div>'
        )

    @admin.display(description="Selector Visual de Portada")
    def selector_de_portada(self, obj):
        if not obj or not obj.pk:
            return mark_safe(
                '<p style="color: #666; font-size: 12px;">Guarda el producto para ver su galería y elegir portada con un clic.</p>'
            )

        images = get_resolved_image_list(obj)
        if not images:
            return mark_safe(
                '<p style="color: #888; font-size: 12px;">No hay imágenes registradas en el array de este producto.</p>'
            )

        current_cover = (obj.image_url or "").strip()
        set_cover_endpoint = reverse('admin:products_product_set_cover', args=[obj.pk])

        cards_html = []
        for index, img_url in enumerate(images):
            is_active = (img_url == current_cover)
            card_border = "#10b981" if is_active else "#cbd5e1"
            badge_bg = "#10b981" if is_active else "#f1f5f9"
            badge_color = "#ffffff" if is_active else "#475569"
            badge_text = "✓ PORTADA ACTUAL" if is_active else "Elegir como portada"
            card_shadow = "0 4px 6px -1px rgba(16, 185, 129, 0.2)" if is_active else "none"

            filename = img_url.rsplit('/', 1)[-1]

            cards_html.append(f'''
            <div class="lumina-img-choice-card"
                 onclick="luminaSelectCover(this, '{img_url}')"
                 style="cursor: pointer; width: 140px; background: white; border: 2.5px solid {card_border}; border-radius: 8px; overflow: hidden; box-shadow: {card_shadow}; transition: all 0.2s ease; position: relative;">
              <img src="{img_url}"
                   style="width: 100%; height: 130px; object-fit: cover; display: block;"
                   onerror="this.src='https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80';" />
              <div style="padding: 6px 4px; text-align: center; border-top: 1px solid #f1f5f9;">
                <span class="lumina-badge"
                      style="display: inline-block; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 3px 6px; border-radius: 4px; background: {badge_bg}; color: {badge_color};">
                  {badge_text}
                </span>
                <span style="display: block; font-size: 10px; color: #888; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="{filename}">
                  {filename}
                </span>
              </div>
            </div>
            ''')

        gallery_html = "".join(cards_html)

        script_html = f'''
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 10px 0 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em;">
                Galería de Imágenes (Haz clic en una para fijarla como Portada)
              </h4>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">
                Al hacer clic en cualquier imagen, se actualiza automáticamente el campo y se guarda de inmediato en la base de datos.
              </p>
            </div>
            <div id="lumina-save-status" style="font-size: 11px; font-weight: bold; color: #10b981; display: none;"></div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start;">
            {gallery_html}
          </div>
        </div>

        <script>
        function luminaSelectCover(cardElem, url) {{
          // 1. Actualizar el input de texto del formulario de Django
          var input = document.getElementById('id_image_url');
          if (input) {{
            input.value = url;
          }}

          // 2. Notificación visual en progreso
          var statusElem = document.getElementById('lumina-save-status');
          if (statusElem) {{
            statusElem.style.display = 'block';
            statusElem.style.color = '#2563eb';
            statusElem.textContent = 'Guardando portada...';
          }}

          // 3. Petición AJAX para persistir en backend de inmediato
          fetch('{set_cover_endpoint}?url=' + encodeURIComponent(url))
            .then(function(res) {{ return res.json(); }})
            .then(function(data) {{
              if (data.status === 'ok') {{
                // Actualizar estilos de todas las tarjetas
                var allCards = document.querySelectorAll('.lumina-img-choice-card');
                allCards.forEach(function(c) {{
                  c.style.border = '2.5px solid #cbd5e1';
                  c.style.boxShadow = 'none';
                  var b = c.querySelector('.lumina-badge');
                  if (b) {{
                    b.textContent = 'Elegir como portada';
                    b.style.background = '#f1f5f9';
                    b.style.color = '#475569';
                  }}
                }});

                // Destacar la tarjeta seleccionada
                cardElem.style.border = '2.5px solid #10b981';
                cardElem.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2)';
                var currentBadge = cardElem.querySelector('.lumina-badge');
                if (currentBadge) {{
                  currentBadge.textContent = '✓ PORTADA ACTUAL';
                  currentBadge.style.background = '#10b981';
                  currentBadge.style.color = '#ffffff';
                }}

                if (statusElem) {{
                  statusElem.style.color = '#10b981';
                  statusElem.textContent = '✓ Portada actualizada con éxito';
                  setTimeout(function() {{ statusElem.style.display = 'none'; }}, 3000);
                }}
              }} else {{
                alert('Error al guardar portada: ' + (data.message || 'Error desconocido'));
              }}
            }})
            .catch(function(err) {{
              console.error('Error:', err);
              if (statusElem) {{
                statusElem.style.color = '#ef4444';
                statusElem.textContent = 'Error de conexión';
              }}
            }});
        }}
        </script>
        '''
        return mark_safe(script_html)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'importar/',
                self.admin_site.admin_view(self.import_catalog_view),
                name='products_product_import'
            ),
            path(
                '<int:product_id>/seleccionar-portada/',
                self.admin_site.admin_view(self.seleccionar_portada_view),
                name='products_product_set_cover'
            ),
            path(
                'limpiar-cache/',
                self.admin_site.admin_view(self.limpiar_cache_view),
                name='products_product_clear_cache'
            ),
        ]
        return custom_urls + urls

    def limpiar_cache_view(self, request):
        """Limpia la caché de catálogo bajo demanda."""
        from django.core.cache import cache
        cache.clear()
        messages.success(request, "✓ Caché de catálogo limpiada correctamente. Los cambios ya son visibles.")
        return redirect('admin:products_product_changelist')

    def seleccionar_portada_view(self, request, product_id):
        """Endpoint AJAX para cambiar la portada de un producto con 1 solo clic."""
        new_url = request.GET.get('url') or request.POST.get('url')
        if not new_url:
            return JsonResponse({'status': 'error', 'message': 'No se proporcionó URL de imagen'}, status=400)

        try:
            prod = Product.objects.get(pk=product_id)
            prod.image_url = new_url
            prod.save(update_fields=['image_url'])
            return JsonResponse({
                'status': 'ok',
                'message': f'Portada de "{prod.name}" actualizada con éxito.',
                'image_url': new_url,
            })
        except Product.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Producto no encontrado'}, status=404)

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        if hasattr(response, 'render') and callable(response.render):
            response.render()
            import_url = reverse('admin:products_product_import')
            cache_url = reverse('admin:products_product_clear_cache')
            btn_html = (
                f'<li><a href="{cache_url}" class="historylink" style="background: #059669; color: white; font-weight: bold; padding: 5px 12px; border-radius: 4px; margin-right: 8px;">'
                f'⚡ Refrescar Caché</a></li>'
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
