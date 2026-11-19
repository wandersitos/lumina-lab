import io
import json
import csv
import os
import openpyxl
from decimal import Decimal
from django.utils.text import slugify
from .models import Product


class CatalogImporter:
    SUPPORTED_EXTENSIONS = ('.json', '.csv', '.xlsx', '.xls')

    def import_file(self, file_source, filename=None):
        """
        Import products from a JSON, CSV or XLSX file/stream.
        Returns dict: {"created": int, "updated": int, "errors": list, "total": int}
        """
        res = {
            'created': 0,
            'updated': 0,
            'errors': [],
            'total': 0
        }

        # Resolve filename
        if not filename:
            if hasattr(file_source, 'name'):
                filename = file_source.name
            elif isinstance(file_source, str):
                filename = file_source
            else:
                filename = ''

        _, ext = os.path.splitext(filename.lower())
        if ext not in self.SUPPORTED_EXTENSIONS:
            res['errors'].append(f"Formato de archivo no soportado: '{ext}'. Use .json, .csv o .xlsx.")
            return res

        try:
            if ext == '.json':
                items = self._parse_json(file_source)
            elif ext == '.csv':
                items = self._parse_csv(file_source)
            elif ext in ('.xlsx', '.xls'):
                items = self._parse_xlsx(file_source)
            else:
                items = []
        except Exception as e:
            res['errors'].append(f"Error al leer archivo: {str(e)}")
            return res

        res['total'] = len(items)

        for idx, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                res['errors'].append(f"Fila/elemento #{idx}: formato inválido (se esperaba un objeto/fila).")
                continue
            try:
                product, created = self._process_item(item)
                if created:
                    res['created'] += 1
                else:
                    res['updated'] += 1
            except Exception as e:
                res['errors'].append(f"Fila/elemento #{idx}: {str(e)}")

        return res

    def _parse_json(self, file_source):
        if hasattr(file_source, 'read'):
            content = file_source.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8')
            data = json.loads(content)
        else:
            with open(file_source, 'r', encoding='utf-8') as f:
                data = json.load(f)

        if isinstance(data, dict) and 'products' in data:
            data = data['products']
        if not isinstance(data, list):
            raise ValueError("El archivo JSON debe contener una lista de productos.")
        return data

    def _parse_csv(self, file_source):
        if hasattr(file_source, 'read'):
            content = file_source.read()
            if isinstance(content, bytes):
                content = content.decode('utf-8-sig', errors='replace')
            f = io.StringIO(content)
        else:
            f = open(file_source, 'r', encoding='utf-8-sig')

        try:
            reader = csv.DictReader(f)
            items = []
            for row in reader:
                items.append({str(k).strip().lower(): v for k, v in row.items() if k is not None})
            return items
        finally:
            if not hasattr(file_source, 'read'):
                f.close()

    def _parse_xlsx(self, file_source):
        if hasattr(file_source, 'read'):
            content = file_source.read()
            wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
        else:
            wb = openpyxl.load_workbook(file_source, data_only=True)

        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []

        headers = [str(h).strip().lower() if h is not None else '' for h in rows[0]]
        items = []
        for row in rows[1:]:
            if not any(cell is not None and str(cell).strip() != '' for cell in row):
                continue
            item = {}
            for h, val in zip(headers, row):
                if h:
                    item[h] = val
            items.append(item)
        return items

    def _process_item(self, raw_item):
        item = {str(k).strip().lower(): v for k, v in raw_item.items() if k is not None}

        name = item.get('name')
        if not name or not str(name).strip():
            raise ValueError("El campo 'name' es obligatorio.")
        name = str(name).strip()

        slug = item.get('slug')
        if not slug or not str(slug).strip():
            slug = slugify(name)
        else:
            slug = slugify(str(slug).strip())

        price_raw = item.get('price')
        if price_raw is None or str(price_raw).strip() == '':
            raise ValueError("El campo 'price' es obligatorio.")
        try:
            cleaned_price = str(price_raw).replace('$', '').replace(',', '').strip()
            price = Decimal(cleaned_price)
            if price < 0:
                raise ValueError("El precio debe ser un número positivo.")
        except Exception:
            raise ValueError(f"Precio inválido: '{price_raw}'. Debe ser un número.")

        description = str(item.get('description', '') or '').strip()
        dimensions = str(item.get('dimensions', '') or '').strip()

        colors_raw = item.get('colors', [])
        if isinstance(colors_raw, list):
            colors = [str(c).strip() for c in colors_raw if str(c).strip()]
        elif isinstance(colors_raw, str):
            colors = [c.strip() for c in colors_raw.split(',') if c.strip()]
        else:
            colors = []

        image_url = item.get('image_url', '')
        if not image_url:
            images_raw = item.get('images', '')
            if isinstance(images_raw, list) and images_raw:
                image_url = str(images_raw[0]).strip()
            elif isinstance(images_raw, str) and images_raw.strip():
                image_url = images_raw.split(',')[0].strip()
        image_url = str(image_url or '').strip()

        is_active_raw = item.get('is_active', True)
        if isinstance(is_active_raw, bool):
            is_active = is_active_raw
        elif isinstance(is_active_raw, str):
            is_active = is_active_raw.strip().lower() in ('true', '1', 'yes', 't', 'si', 'sí')
        elif isinstance(is_active_raw, (int, float)):
            is_active = bool(is_active_raw)
        else:
            is_active = True

        defaults = {
            'name': name,
            'price': price,
            'description': description,
            'dimensions': dimensions,
            'image_url': image_url,
            'colors': colors,
            'is_active': is_active,
        }

        product, created = Product.objects.update_or_create(slug=slug, defaults=defaults)
        return product, created
