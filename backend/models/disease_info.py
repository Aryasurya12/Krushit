# Mapping of class indices to disease names and structured info
# Note: These indices should match the training output of your model.h5

DISEASE_INFO = {
    0: {
        "disease": "Apple Scab",
        "solution": "Apply fungicides like captan or mancozeb. Prune affected branches to improve airflow.",
        "prevention": "Choose resistant varieties. Clean up fallen leaves in autumn.",
        "fertilizer_advice": "Maintain balanced NPK. Avoid over-fertilizing with nitrogen which creates lush, susceptible growth."
    },
    1: {
        "disease": "Apple Black Rot",
        "solution": "Remove all dead wood and mummified fruit. Apply fungicide during bloom.",
        "prevention": "Prune during dormancy. Avoid mechanical injury to fruit.",
        "fertilizer_advice": "Ensure adequate Calcium levels for stronger cell walls."
    },
    2: {
        "disease": "Apple Cedar Rust",
        "solution": "Apply fungicides when orange gelatinous galls appear on cedar trees nearby.",
        "prevention": "Remove nearby red cedar trees if possible. Use resistant cultivars.",
        "fertilizer_advice": "Regular fertilization to keep the tree vigorous."
    },
    3: {
        "disease": "Apple Healthy",
        "solution": "No treatment needed.",
        "prevention": "Continue regular monitoring and good sanitation.",
        "fertilizer_advice": "Standard seasonal fertilization schedule."
    },
    4: {
        "disease": "Blueberry Healthy",
        "solution": "No treatment needed.",
        "prevention": "Maintain soil pH between 4.5 and 5.5.",
        "fertilizer_advice": "Use acid-forming fertilizers like ammonium sulfate."
    },
    5: {
        "disease": "Cherry Powdery Mildew",
        "solution": "Apply sulfur or neem oil. Increase sunlight penetration through pruning.",
        "prevention": "Ensure proper spacing between trees for airflow.",
        "fertilizer_advice": "Avoid late-season high nitrogen applications."
    },
    6: {
        "disease": "Cherry Healthy",
        "solution": "No treatment needed.",
        "prevention": "Prune for shape and light.",
        "fertilizer_advice": "Balanced organic compost in spring."
    },
    7: {
        "disease": "Corn Gray Leaf Spot",
        "solution": "Apply foliar fungicides. Rotate crops to non-host species.",
        "prevention": "Use resistant hybrids. Manage crop residue.",
        "fertilizer_advice": "Optimize Potassium levels to help the plant manage stress."
    },
    8: {
        "disease": "Corn Common Rust",
        "solution": "Fungicides are usually not needed unless infection is severe and early.",
        "prevention": "Plant resistant hybrids.",
        "fertilizer_advice": "Ensure adequate nutrients to support rapid growth."
    },
    9: {
        "disease": "Corn Northern Leaf Blight",
        "solution": "Apply fungicides if disease appears early on upper leaves.",
        "prevention": "Crop rotation and tillage to bury infected residue.",
        "fertilizer_advice": "Balanced nutrition to improve overall plant health."
    },
    10: {
        "disease": "Corn Healthy",
        "solution": "No treatment needed.",
        "prevention": "Maintain consistent irrigation.",
        "fertilizer_advice": "Apply nitrogen in split applications."
    },
    11: {
        "disease": "Grape Black Rot",
        "solution": "Remove infected berries. Spray fungicides starting at 1-inch shoot growth.",
        "prevention": "Full sun exposure and good drainage. Remove wild grapes nearby.",
        "fertilizer_advice": "Avoid excessive nitrogen which promotes dense canopies."
    },
    12: {
        "disease": "Grape Esca (Black Measles)",
        "solution": "No cure. Protect pruning wounds with sealant.",
        "prevention": "Purchase certified disease-free nursery stock.",
        "fertilizer_advice": "Balanced fertilization to minimize stress."
    },
    13: {
        "disease": "Grape Leaf Blight (Isariopsis)",
        "solution": "Copper-based sprays or fungicides. Prune to improve airflow.",
        "prevention": "Remove and burn old leaves. Improve drainage.",
        "fertilizer_advice": "Ensure good levels of micronutrients."
    },
    14: {
        "disease": "Grape Healthy",
        "solution": "No treatment needed.",
        "prevention": "Regular pruning and trellis management.",
        "fertilizer_advice": "Apply compost or organic fertilizers."
    },
    15: {
        "disease": "Orange Haunglongbing (Citrus Greening)",
        "solution": "No cure. Remove infected trees immediately to prevent spread.",
        "prevention": "Control Asian Citrus Psyllid vector. Use screen-houses.",
        "fertilizer_advice": "Enhanced nutritional programs can help prolong tree life."
    },
    16: {
        "disease": "Peach Bacterial Spot",
        "solution": "Copper-based sprays in late dormant or early bloom stage.",
        "prevention": "Avoid planting in very windy sites. Use resistant varieties.",
        "fertilizer_advice": "Keep trees moderately vigorous."
    },
    17: {
        "disease": "Peach Healthy",
        "solution": "No treatment needed.",
        "prevention": "Monitor for borers.",
        "fertilizer_advice": "Nitrogen application in early spring."
    },
    18: {
        "disease": "Pepper Bell Bacterial Spot",
        "solution": "Copper sprays and streptomycin can help. Rotate with corn or small grains.",
        "prevention": "Use disease-free seed. Avoid overhead irrigation.",
        "fertilizer_advice": "Ensure adequate Phosphorus for root development."
    },
    19: {
        "disease": "Pepper Bell Healthy",
        "solution": "No treatment needed.",
        "prevention": "Mulching to prevent soil splashing.",
        "fertilizer_advice": "Balanced 10-10-10 fertilizer."
    },
    20: {
        "disease": "Potato Early Blight",
        "solution": "Apply fungicides containing chlorothalonil. Rotate with legumes or grains.",
        "prevention": "Manage irrigation to keep foliage dry. Destroy volunteers.",
        "fertilizer_advice": "Increase Potassium and Phosphorus if soil test is low."
    },
    21: {
        "disease": "Potato Late Blight",
        "solution": "URGENT: Use systemic fungicides. Destroy infected plants immediately.",
        "prevention": "Use certified seed tubers. Avoid cull piles.",
        "fertilizer_advice": "Avoid over-fertilizing with Nitrogen late in the season."
    },
    22: {
        "disease": "Potato Healthy",
        "solution": "No treatment needed.",
        "prevention": "Practice 3-year crop rotation.",
        "fertilizer_advice": "Sufficient Nitrogen early in growth."
    },
    23: {
        "disease": "Raspberry Healthy",
        "solution": "No treatment needed.",
        "prevention": "Prune out old canes after harvest.",
        "fertilizer_advice": "Top dress with aged manure."
    },
    24: {
        "disease": "Soybean Healthy",
        "solution": "No treatment needed.",
        "prevention": "Monitor for soybean aphids.",
        "fertilizer_advice": "Ensure adequate soil Sulfur."
    },
    25: {
        "disease": "Squash Powdery Mildew",
        "solution": "Apply sulfur or potassium bicarbonate sprays.",
        "prevention": "Plant in full sun. Increase plant spacing.",
        "fertilizer_advice": "Avoid over-fertilizing."
    },
    26: {
        "disease": "Strawberry Leaf Scorch",
        "solution": "Fungicides like captan. Remove infected foliage after harvest.",
        "prevention": "Renovate beds annually. Avoid excessive nitrogen in spring.",
        "fertilizer_advice": "Apply fertilizer after renovation."
    },
    27: {
        "disease": "Strawberry Healthy",
        "solution": "No treatment needed.",
        "prevention": "Use clean, certified runners.",
        "fertilizer_advice": "Balanced organic pellets."
    },
    28: {
        "disease": "Tomato Bacterial Spot",
        "solution": "Copper-based sprays. Avoid handling plants when wet.",
        "prevention": "Rotate crops every 2 years. Use disease-free seed.",
        "fertilizer_advice": "Don't over-water which leaches nutrients."
    },
    29: {
        "disease": "Tomato Early Blight",
        "solution": "Apply fungicides. Mulch ground to prevent soil splash.",
        "prevention": "Prune lower leaves. Crop rotation.",
        "fertilizer_advice": "Ensure enough Calcium to prevent related physiological issues."
    },
    30: {
        "disease": "Tomato Late Blight",
        "solution": "URGENT: Use copper sprays. Remove and destroy infected plants.",
        "prevention": "Plant resistant cultivars. Improve airflow.",
        "fertilizer_advice": "Regular feeding schedule."
    },
    31: {
        "disease": "Tomato Leaf Mold",
        "solution": "Reduce humidity. Use fungicides containing chlorothalonil.",
        "prevention": "Improve greenhouse ventilation. Avoid overhead watering.",
        "fertilizer_advice": "Maintain steady nutrient levels."
    },
    32: {
        "disease": "Tomato Septoria Leaf Spot",
        "solution": "Apply fungicides. Practice long-term crop rotation.",
        "prevention": "Remove weed hosts like nightshade. Mulch under plants.",
        "fertilizer_advice": "Avoid high pressure water which splashes spores."
    },
    33: {
        "disease": "Tomato Spider Mites (Two-spotted Spider Mite)",
        "solution": "Spray with neem oil or insecticidal soap. Increase humidity.",
        "prevention": "Drought-stressed plants are more susceptible. Keep soil moist.",
        "fertilizer_advice": "Avoid excessive nitrogen as it attracts mites."
    },
    34: {
        "disease": "Tomato Target Spot",
        "solution": "Fungicide sprays. Stake and prune for airflow.",
        "prevention": "Manage weeds. Rotate crops.",
        "fertilizer_advice": "Healthy plants are more resistant."
    },
    35: {
        "disease": "Tomato Yellow Leaf Curl Virus",
        "solution": "No cure. Control Whiteflies using insecticidal soap or neem oil.",
        "prevention": "Use insect nets in greenhouses. Rogue infected plants.",
        "fertilizer_advice": "Balanced fertilization with micronutrients."
    },
    36: {
        "disease": "Tomato Mosaic Virus",
        "solution": "No cure. Rogue infected plants. Do not smoke near plants.",
        "prevention": "Wash hands with soap before touching plants. Disinfect tools.",
        "fertilizer_advice": "Optimize soil health."
    },
    37: {
        "disease": "Tomato Healthy",
        "solution": "No treatment needed.",
        "prevention": "Regular scouting.",
        "fertilizer_advice": "Consistent feeding with Tomato-specific fertilizer."
    }
}

# Helper to get info by index or name
def get_disease_details(key):
    # Default response if not found
    default = {
        "disease": "Unknown",
        "solution": "Consult with a local agricultural expert for diagnosis.",
        "prevention": "Practice good crop rotation and field sanitation.",
        "fertilizer_advice": "Maintain balanced soil nutrition based on a recent soil test."
    }
    
    if isinstance(key, int):
        return DISEASE_INFO.get(key, default)
    
    # Optional: search by name
    for info in DISEASE_INFO.values():
        if info["disease"].lower() == str(key).lower():
            return info
            
    return default
