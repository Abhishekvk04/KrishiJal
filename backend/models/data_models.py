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
        "kc_development": 1.2,
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
    },
    
    # South Indian Crops
    "Coconut": {
        "kc_initial": 0.8,
        "kc_development": 0.9,
        "kc_mid": 1.0,
        "kc_late": 1.0,
        "growth_stages": ["Young Palm (0-5 years)", "Bearing Palm (6-15 years)", "Prime Bearing (16-50 years)", "Old Palm (50+ years)"],
        "rooting_depth": 2.0,
        "critical_depletion": 0.4,
        "season_length": 365  # Perennial crop
    },
    "Arecanut": {
        "kc_initial": 0.7,
        "kc_development": 0.8,
        "kc_mid": 0.95,
        "kc_late": 0.9,
        "growth_stages": ["Young Palm (0-7 years)", "Bearing Palm (8-20 years)", "Prime Bearing (21-40 years)", "Old Palm (40+ years)"],
        "rooting_depth": 1.5,
        "critical_depletion": 0.4,
        "season_length": 365  # Perennial crop
    },
    "Banana": {
        "kc_initial": 0.5,
        "kc_development": 0.75,
        "kc_mid": 1.1,
        "kc_late": 0.9,
        "growth_stages": ["Planting (0-60 days)", "Vegetative (61-150 days)", "Flowering (151-210 days)", "Fruiting (211-300 days)"],
        "rooting_depth": 0.8,
        "critical_depletion": 0.35,
        "season_length": 300
    },
    "Sugarcane": {
        "kc_initial": 0.4,
        "kc_development": 0.8,
        "kc_mid": 1.25,
        "kc_late": 0.75,
        "growth_stages": ["Germination (0-45 days)", "Tillering (46-120 days)", "Grand Growth (121-270 days)", "Maturity (271-365 days)"],
        "rooting_depth": 1.2,
        "critical_depletion": 0.65,
        "season_length": 365
    },
    "Cotton": {
        "kc_initial": 0.35,
        "kc_development": 0.7,
        "kc_mid": 1.15,
        "kc_late": 0.5,
        "growth_stages": ["Emergence (0-30 days)", "Squaring (31-65 days)", "Flowering (66-125 days)", "Boll Opening (126-180 days)"],
        "rooting_depth": 1.0,
        "critical_depletion": 0.65,
        "season_length": 180
    },
    "Groundnut": {
        "kc_initial": 0.4,
        "kc_development": 0.7,
        "kc_mid": 1.15,
        "kc_late": 0.6,
        "growth_stages": ["Emergence (0-25 days)", "Vegetative (26-45 days)", "Flowering (46-75 days)", "Pod Development (76-110 days)"],
        "rooting_depth": 0.6,
        "critical_depletion": 0.5,
        "season_length": 110
    },
    "Chili": {
        "kc_initial": 0.6,
        "kc_development": 0.8,
        "kc_mid": 1.05,
        "kc_late": 0.8,
        "growth_stages": ["Nursery (0-35 days)", "Vegetative (36-65 days)", "Flowering (66-95 days)", "Fruiting (96-150 days)"],
        "rooting_depth": 0.7,
        "critical_depletion": 0.45,
        "season_length": 150
    },
    "Onion": {
        "kc_initial": 0.7,
        "kc_development": 0.85,
        "kc_mid": 1.05,
        "kc_late": 0.75,
        "growth_stages": ["Establishment (0-25 days)", "Vegetative (26-75 days)", "Bulb Development (76-110 days)", "Maturity (111-130 days)"],
        "rooting_depth": 0.4,
        "critical_depletion": 0.3,
        "season_length": 130
    },
    "Turmeric": {
        "kc_initial": 0.5,
        "kc_development": 0.75,
        "kc_mid": 1.0,
        "kc_late": 0.6,
        "growth_stages": ["Sprouting (0-45 days)", "Vegetative (46-120 days)", "Rhizome Development (121-210 days)", "Maturity (211-270 days)"],
        "rooting_depth": 0.5,
        "critical_depletion": 0.4,
        "season_length": 270
    },
    "Cardamom": {
        "kc_initial": 0.6,
        "kc_development": 0.75,
        "kc_mid": 0.9,
        "kc_late": 0.85,
        "growth_stages": ["Young Plant (0-3 years)", "Bearing Plant (4-10 years)", "Prime Bearing (11-20 years)", "Old Plant (20+ years)"],
        "rooting_depth": 0.8,
        "critical_depletion": 0.3,
        "season_length": 365  # Perennial crop
    },
    "Coffee": {
        "kc_initial": 0.7,
        "kc_development": 0.8,
        "kc_mid": 0.95,
        "kc_late": 0.9,
        "growth_stages": ["Young Plant (0-3 years)", "Bearing Plant (4-15 years)", "Prime Bearing (16-30 years)", "Old Plant (30+ years)"],
        "rooting_depth": 1.5,
        "critical_depletion": 0.4,
        "season_length": 365  # Perennial crop
    },
    "Mango": {
        "kc_initial": 0.6,
        "kc_development": 0.75,
        "kc_mid": 0.9,
        "kc_late": 0.85,
        "growth_stages": ["Young Tree (0-5 years)", "Bearing Tree (6-15 years)", "Prime Bearing (16-40 years)", "Old Tree (40+ years)"],
        "rooting_depth": 2.5,
        "critical_depletion": 0.5,
        "season_length": 365  # Perennial crop
    },
    "Papaya": {
        "kc_initial": 0.6,
        "kc_development": 0.8,
        "kc_mid": 1.0,
        "kc_late": 0.9,
        "growth_stages": ["Seedling (0-60 days)", "Vegetative (61-180 days)", "Flowering (181-270 days)", "Fruiting (271-365 days)"],
        "rooting_depth": 1.0,
        "critical_depletion": 0.4,
        "season_length": 365
    },
    "Jackfruit": {
        "kc_initial": 0.6,
        "kc_development": 0.75,
        "kc_mid": 0.9,
        "kc_late": 0.85,
        "growth_stages": ["Young Tree (0-7 years)", "Bearing Tree (8-20 years)", "Prime Bearing (21-50 years)", "Old Tree (50+ years)"],
        "rooting_depth": 2.0,
        "critical_depletion": 0.5,
        "season_length": 365  # Perennial crop
    },
    "Drumstick": {
        "kc_initial": 0.5,
        "kc_development": 0.7,
        "kc_mid": 0.85,
        "kc_late": 0.8,
        "growth_stages": ["Seedling (0-90 days)", "Vegetative (91-180 days)", "Flowering (181-270 days)", "Pod Development (271-365 days)"],
        "rooting_depth": 1.5,
        "critical_depletion": 0.6,
        "season_length": 365
    },
    "Ragi": {
        "kc_initial": 0.4,
        "kc_development": 0.7,
        "kc_mid": 1.0,
        "kc_late": 0.5,
        "growth_stages": ["Emergence (0-20 days)", "Tillering (21-45 days)", "Heading (46-75 days)", "Maturity (76-120 days)"],
        "rooting_depth": 0.8,
        "critical_depletion": 0.6,
        "season_length": 120
    },
    "Jowar": {
        "kc_initial": 0.35,
        "kc_development": 0.7,
        "kc_mid": 1.1,
        "kc_late": 0.55,
        "growth_stages": ["Emergence (0-25 days)", "Vegetative (26-60 days)", "Heading (61-90 days)", "Maturity (91-115 days)"],
        "rooting_depth": 1.0,
        "critical_depletion": 0.6,
        "season_length": 115
    },
    "Bajra": {
        "kc_initial": 0.35,
        "kc_development": 0.7,
        "kc_mid": 1.05,
        "kc_late": 0.55,
        "growth_stages": ["Emergence (0-20 days)", "Vegetative (26-50 days)", "Heading (51-75 days)", "Maturity (76-100 days)"],
        "rooting_depth": 1.2,
        "critical_depletion": 0.65,
        "season_length": 100
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