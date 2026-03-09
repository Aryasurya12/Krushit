import csv
import json
import os

csv_path = r"d:\Antigravity\AgriTech\agritech-app\master_recommendation_dataset.csv"
output_path = r"d:\Antigravity\AgriTech\agritech-app\class_names.json"

diseases = set()
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        diseases.add(row['disease_name'])

sorted_diseases = sorted(list(diseases))
class_names = {str(i): d for i, d in enumerate(sorted_diseases)}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(class_names, f, indent=4)

print(f"Successfully updated {output_path} with {len(class_names)} classes.")
