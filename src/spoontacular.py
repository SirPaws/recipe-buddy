import yaml
import requests

class Spoontacular:
    def __init__(self):
        rapidapi = Spoontacular.loadRapidAPI()

        self.url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/"
        self.headers = {
            'x-rapidapi-host': "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            'x-rapidapi-key':  rapidapi['X-RapidAPI-Key'],
        }
    
    def loadRapidAPI():
        rapidapi_privates = {}
        with open('src/key.yaml', 'r') as file:
            rapidapi_privates = yaml.safe_load(file)
        
        return rapidapi_privates

    def query(self, params, urlpath):
        response = requests.request('GET', self.url + urlpath, headers=self.headers, params=params)
        return response
    
    def findRecipeFromIngredients(self, ingredients, ignorePantry=True):
        return self.query(
            urlpath='recipes/findByIngredients',
            params= {
            "ingredients":  ingredients,
            "number":       "5",
            "ignorePantry": str(ignorePantry),
            "ranking":"1"
        })
