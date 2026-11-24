from abc import ABC, abstractmethod
import unicodedata

def normalize_text(text: str) -> str:
    """Elimina tildes y pasa a minúsculas para comparaciones robustas."""
    if not text:
        return ""
    nfkd = unicodedata.normalize('NFKD', text)
    return "".join([c for c in nfkd if not unicodedata.combining(c)]).strip().lower()

class ShippingRateService(ABC):
    """Puerto de cotización de envíos (Arquitectura Hexagonal Q-1)."""
    @abstractmethod
    def calculate_quote(self, city: str, department: str = "", items_count: int = 1) -> dict:
        pass

class EnvioclickAdapter(ShippingRateService):
    """
    Adaptador de cotización de Envíoclick calibrado para Colombia.
    Tarifas base en COP:
    - Medellín: $10.000 (Coordinadora, 1-2 días)
    - Bogotá: $13.500 (Servientrega, 2-3 días)
    - Cali: $14.000 (Envía, 2-3 días)
    - Barranquilla: $16.000 (Coordinadora, 3-4 días)
    - Bucaramanga: $14.500 (Servientrega, 2-3 días)
    - Destino Nacional estándar: $18.000 (Interrapidísimo, 3-5 días)
    
    Adicional por ítem extra: $2.500 por lámpara.
    """

    BASE_RATES = {
        'medellin': {'base': 10000, 'carrier': 'Coordinadora', 'days': '1-2 días hábiles'},
        'bogota': {'base': 13500, 'carrier': 'Servientrega', 'days': '2-3 días hábiles'},
        'cali': {'base': 14000, 'carrier': 'Envía', 'days': '2-3 días hábiles'},
        'barranquilla': {'base': 16000, 'carrier': 'Coordinadora', 'days': '3-4 días hábiles'},
        'bucaramanga': {'base': 14500, 'carrier': 'Servientrega', 'days': '2-3 días hábiles'},
        'cartagena': {'base': 16000, 'carrier': 'Coordinadora', 'days': '3-4 días hábiles'},
        'pereira': {'base': 14000, 'carrier': 'Servientrega', 'days': '2-3 días hábiles'},
        'manizales': {'base': 14000, 'carrier': 'Servientrega', 'days': '2-3 días hábiles'},
    }
    DEFAULT_RATE = {'base': 18000, 'carrier': 'Interrapidísimo', 'days': '3-5 días hábiles'}
    ADDITIONAL_ITEM_FEE = 2500

    def calculate_quote(self, city: str, department: str = "", items_count: int = 1) -> dict:
        norm_city = normalize_text(city)
        if not norm_city:
            raise ValueError("La ciudad de destino es obligatoria.")

        rate_info = self.BASE_RATES.get(norm_city, self.DEFAULT_RATE)
        
        count = max(1, items_count)
        additional_cost = (count - 1) * self.ADDITIONAL_ITEM_FEE
        total_cost = rate_info['base'] + additional_cost

        return {
            'city': city.strip(),
            'department': department.strip() if department else '',
            'carrier': rate_info['carrier'],
            'cost': total_cost,
            'estimated_days': rate_info['days'],
            'currency': 'COP',
            'items_count': count,
        }
