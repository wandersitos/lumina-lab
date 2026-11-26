from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    price = serializers.IntegerField()
    option_groups = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'dimensions',
            'image_url',
            'colors',
            'is_active',
            'created_at',
            'collection',
            'category',
            'in_stock',
            'images',
            'order',
            'material',
            'option_groups',
        ]

    def get_option_groups(self, obj):
        assignments = list(obj.option_assignments.all())
        visible_assignments = [
            a for a in assignments
            if a.is_visible and a.option.is_visible and a.option.group.is_active
        ]
        visible_assignments.sort(
            key=lambda a: (
                a.option.group.order,
                a.option.group.id,
                a.option.order,
                a.option.id,
            )
        )

        groups_map = {}
        for assignment in visible_assignments:
            option = assignment.option
            group = option.group
            if group.id not in groups_map:
                groups_map[group.id] = {
                    'id': group.id,
                    'name': group.name,
                    'slug': group.slug,
                    'order': group.order,
                    'options': [],
                }
            effective_price_delta = (
                assignment.price_delta_override
                if assignment.price_delta_override is not None
                else option.price_delta
            )
            effective_price = (
                assignment.price_override
                if assignment.price_override is not None
                else option.price
            )
            effective_dimensions = assignment.dimensions_override or option.dimensions or ''
            effective_production_time = assignment.production_time_override or option.production_time or ''
            groups_map[group.id]['options'].append({
                'id': option.id,
                'name': option.name,
                'slug': option.slug,
                'price_delta': effective_price_delta,
                'effective_price': effective_price,
                'effective_dimensions': effective_dimensions,
                'effective_production_time': effective_production_time,
                'in_stock': bool(option.in_stock and assignment.in_stock),
                'order': option.order,
            })

        return list(groups_map.values())
