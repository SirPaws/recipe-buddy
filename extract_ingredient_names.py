import json

with open('ingredients.json', encoding="utf-8") as json_file:
  data = json.load(json_file)

names = []
for tag in data['tags']:
    if tag['id'].startswith('en:'):
        names.append(tag['name'])

names = [name.replace('-', ' ') for name in names]
print(names)

with open("ingredient_names.json", "w") as json_file:
    json.dump(names, json_file)

