SOIL_TYPES = {
    "Sandy": {
        "field_capacity": 0.15,
        "wilting_point": 0.05,
        "infiltration_rate": "High (25-250 mm/hr)",
        "water_holding_capacity": "Low",
        "description": "Drains quickly, requires frequent irrigation",
        "bulk_density": 1.6,
        "porosity": 0.4
    },
    "Clay": {
        "field_capacity": 0.35,
        "wilting_point": 0.18,
        "infiltration_rate": "Low (1-5 mm/hr)",
        "water_holding_capacity": "High",
        "description": "Retains water well, less frequent irrigation needed",
        "bulk_density": 1.3,
        "porosity": 0.5
    },
    "Loam": {
        "field_capacity": 0.25,
        "wilting_point": 0.12,
        "infiltration_rate": "Medium (5-25 mm/hr)",
        "water_holding_capacity": "Medium",
        "description": "Balanced drainage and retention",
        "bulk_density": 1.4,
        "porosity": 0.45
    },
    "Sandy Loam": {
        "field_capacity": 0.28,
        "wilting_point": 0.12,
        "infiltration_rate": "Medium-High (15-75 mm/hr)",
        "water_holding_capacity": "Medium-Low",
        "description": "Moderate water retention",
        "bulk_density": 1.5,
        "porosity": 0.43
    }
}

CROP_DATABASE = {
    "Tomato": {
        "kc_initial": 0.6,
        "kc_development": 0.8,
        "kc_mid": 1.15,
        "kc_late": 0.8,
        "growth_stages": ["Germination (0-15 days)", "Vegetative (16-45 days)", "Flowering (46-75 days)", "Fruiting (76-120 days)"],
        "rooting_depth": 1.0,
        "critical_depletion": 0.5,
        "season_length": 120
    },
    "Wheat": {
        "kc_initial": 0.4,
        "kc_development": 0.7,
        "kc_mid": 1.15,
        "kc_late": 0.4,
        "growth_stages": ["Emergence (0-20 days)", "Tillering (21-60 days)", "Heading (61-100 days)", "Maturity (101-130 days)"],
        "rooting_depth": 1.2,
        "critical_depletion": 0.6,
        "season_length": 130
    },
    "Rice": {
        "kc_initial": 1.15,
        "stress_factor": 1.2, 
        "kc_mid": 1.20,
        "kc_late": 0.9,
        "growth_stages": ["Nursery (0-30 days)", "Vegetative (31-65 days)", "Reproductive (66-95 days)", "Maturity (96-120 days)"],
        "rooting_depth": 0.5,
        "critical_depletion": 0.2,
        "season_length": 120
    },
    "Corn": {
        "kc_initial": 0.3,
        "kc_development": 0.7,
        "kc_mid": 1.20,
        "kc_late": 0.6,
        "growth_stages": ["Emergence (0-25 days)", "Vegetative (26-60 days)", "Tasseling (61-90 days)", "Maturity (91-125 days)"],
        "rooting_depth": 1.0,
        "critical_depletion": 0.55,
        "season_length": 125
    }
}

SOIL_THRESHOLDS = {
    "Sandy": 0.3,
    "Sandy Loam": 0.4,
    "Loam": 0.5,
    "Clay": 0.6
}

IRRIGATION_TRIGGERS = {  # mm depletion thresholds
    "Sandy": 30, 
    "Sandy Loam": 45,
    "Loam": 20,
    "Clay": 15
}