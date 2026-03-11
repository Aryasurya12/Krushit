export interface TreatmentProtocol {
    chemical: string;
    dosage: number; // per acre
    unit: string;
    pricePerUnit: number;
    method: string;
    organicAlternative: string;
    organicDosage: number;
    organicUnit: string;
    organicPrice: number;
    marketplaceLinks: {
        agrostar: string;
        bighaat: string;
        indiamart: string;
    };
}

export const TREATMENT_PROTOCOLS: Record<string, TreatmentProtocol> = {
    "Corn___Common_Rust": {
        chemical: "Propiconazole 25% EC",
        dosage: 200,
        unit: "ml",
        pricePerUnit: 1.5,
        method: "Foliar Spray",
        organicAlternative: "Neem Oil + Baking Soda",
        organicDosage: 5,
        organicUnit: "liters",
        organicPrice: 400,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=propiconazole",
            bighaat: "https://www.bighaat.com/search?q=propiconazole",
            indiamart: "https://dir.indiamart.com/search.mp?ss=propiconazole"
        }
    },
    "Corn___Gray_Leaf_Spot": {
        chemical: "Azoxystrobin 23% SC",
        dosage: 250,
        unit: "ml",
        pricePerUnit: 2.8,
        method: "High volume spray",
        organicAlternative: "Trichoderma viride",
        organicDosage: 1,
        organicUnit: "kg",
        organicPrice: 250,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=azoxystrobin",
            bighaat: "https://www.bighaat.com/search?q=azoxystrobin",
            indiamart: "https://dir.indiamart.com/search.mp?ss=azoxystrobin"
        }
    },
    "Potato___Early_Blight": {
        chemical: "Mancozeb 75% WP",
        dosage: 2,
        unit: "kg",
        pricePerUnit: 450,
        method: "Drenching/Spray",
        organicAlternative: "Seaweed Extract",
        organicDosage: 2,
        organicUnit: "liters",
        organicPrice: 600,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=mancozeb",
            bighaat: "https://www.bighaat.com/search?q=mancozeb",
            indiamart: "https://dir.indiamart.com/search.mp?ss=mancozeb"
        }
    },
    "Potato___Late_Blight": {
        chemical: "Metalaxyl 8% + Mancozeb 64%",
        dosage: 1.5,
        unit: "kg",
        pricePerUnit: 1200,
        method: "Intensive Spray",
        organicAlternative: "Garlic-Chili Spray",
        organicDosage: 10,
        organicUnit: "liters",
        organicPrice: 300,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=metalaxyl+mancozeb",
            bighaat: "https://www.bighaat.com/search?q=metalaxyl+mancozeb",
            indiamart: "https://dir.indiamart.com/search.mp?ss=metalaxyl+mancozeb"
        }
    },
    "Rice___Leaf_Blast": {
        chemical: "Tricyclazole 75% WP",
        dosage: 300,
        unit: "g",
        pricePerUnit: 4,
        method: "Foliar Application",
        organicAlternative: "Pseudomonas fluorescens",
        organicDosage: 2,
        organicUnit: "kg",
        organicPrice: 180,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=tricyclazole",
            bighaat: "https://www.bighaat.com/search?q=tricyclazole",
            indiamart: "https://dir.indiamart.com/search.mp?ss=tricyclazole"
        }
    },
    "Wheat___Yellow_Rust": {
        chemical: "Tebuconazole 25.9% EC",
        dosage: 200,
        unit: "ml",
        pricePerUnit: 3.5,
        method: "Mist Spray",
        organicAlternative: "Sour Butter Milk",
        organicDosage: 20,
        organicUnit: "liters",
        organicPrice: 50,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=tebuconazole",
            bighaat: "https://www.bighaat.com/search?q=tebuconazole",
            indiamart: "https://dir.indiamart.com/search.mp?ss=tebuconazole"
        }
    },
    "Corn___Nitrogen_Deficiency": {
        chemical: "Urea (46% N)",
        dosage: 50,
        unit: "kg",
        pricePerUnit: 6,
        method: "Top Dressing",
        organicAlternative: "Vermicompost",
        organicDosage: 500,
        organicUnit: "kg",
        organicPrice: 5,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=urea",
            bighaat: "https://www.bighaat.com/search?q=urea",
            indiamart: "https://dir.indiamart.com/search.mp?ss=urea"
        }
    },
    "Rice___Nitrogen_Deficiency": {
        chemical: "Ammonium Sulfate",
        dosage: 40,
        unit: "kg",
        pricePerUnit: 15,
        method: "Broadcast",
        organicAlternative: "Green Manure (Dhaincha)",
        organicDosage: 1,
        organicUnit: "acre",
        organicPrice: 1200,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in/search?q=ammonium+sulfate",
            bighaat: "https://www.bighaat.com/search?q=ammonium+sulfate",
            indiamart: "https://dir.indiamart.com/search.mp?ss=ammonium+sulfate"
        }
    }
};

export function getProtocol(diseaseName: string): TreatmentProtocol | null {
    // Exact match
    if (TREATMENT_PROTOCOLS[diseaseName]) return TREATMENT_PROTOCOLS[diseaseName];

    // Fuzzy matching for common issues
    const lowerName = diseaseName.toLowerCase();
    if (lowerName.includes("rust")) return TREATMENT_PROTOCOLS["Corn___Common_Rust"];
    if (lowerName.includes("blight")) return TREATMENT_PROTOCOLS["Potato___Early_Blight"];
    if (lowerName.includes("blast")) return TREATMENT_PROTOCOLS["Rice___Leaf_Blast"];
    if (lowerName.includes("nitrogen")) return TREATMENT_PROTOCOLS["Corn___Nitrogen_Deficiency"];
    if (lowerName.includes("potassium")) return TREATMENT_PROTOCOLS["Corn___Nitrogen_Deficiency"]; // Fallback for deficiency
    
    // Default fallback
    return {
        chemical: "General Nutrients & Protection",
        dosage: 1,
        unit: "Unit",
        pricePerUnit: 500,
        method: "Broadcasting",
        organicAlternative: "Organic Compost",
        organicDosage: 50,
        organicUnit: "kg",
        organicPrice: 10,
        marketplaceLinks: {
            agrostar: "https://www.agrostar.in",
            bighaat: "https://www.bighaat.com",
            indiamart: "https://www.indiamart.com"
        }
    };
}
