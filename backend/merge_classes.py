import csv
import json

original_22 = {
    "0": "Corn___Common_Rust", "1": "Corn___Gray_Leaf_Spot", "2": "Corn___Healthy", "3": "Corn___Northern_Leaf_Blight", 
    "4": "Jowar___Healthy", "5": "Jowar___Rust", "6": "Mango___Anthracnose", "7": "Mango___Healthy", "8": "Mango___Powdery_Mildew", 
    "9": "Potato___Early_Blight", "10": "Potato___Healthy", "11": "Potato___Late_Blight", "12": "Rice___Brown_Spot", 
    "13": "Rice___Healthy", "14": "Rice___Leaf_Blast", "15": "Rice___Neck_Blast", "16": "Sugarcane_Bacterial Blight", 
    "17": "Sugarcane_Healthy", "18": "Sugarcane_Red Rot", "19": "Wheat___Brown_Rust", "20": "Wheat___Healthy", "21": "Wheat___Yellow_Rust"
}

csv_path = r"d:\Antigravity\AgriTech\agritech-app\master_recommendation_dataset.csv"
diseases_in_csv = set()
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        diseases_in_csv.add(row['disease_name'])

# Normalize names for comparison (Sugarcane_Red Rot vs Sugarcane___Red_Rot)
def normalize(name):
    return name.replace("___", "_").replace(" ", "_").lower()

normalized_original = {normalize(v): v for v in original_22.values()}
new_diseases = []
for d in sorted(list(diseases_in_csv)):
    if normalize(d) not in normalized_original:
        new_diseases.append(d)

# Build the 44 classes
final_classes = original_22.copy()
idx = 22
for d in new_diseases:
    final_classes[str(idx)] = d
    idx += 1

# Pad to 44 if needed
while idx < 44:
    final_classes[str(idx)] = f"Unknown_Disease_{idx}"
    idx += 1

output_path = r"d:\Antigravity\AgriTech\agritech-app\class_names.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_classes, f, indent=4)

print(f"Total classes merged: {len(final_classes)}")
print(f"New diseases added: {len(new_diseases)}")
