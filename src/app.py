from flask import Flask, render_template
from flask_restful import Api

from rest import GetIngredients, AddIngredients, RemoveIngredients ,GetRecipes, GetRecipeInfo
from spoontacular import Spoontacular

app = Flask(__name__)
api = Api(app)

if not 'X-RapidAPI-Key' in Spoontacular.loadRapidAPI().keys():
    print('this requires a yaml file with your rapid api key!')
    print('create a file in the src directory named \'key.yaml\'')
    print('and then add the line \'X-RapidAPI-Key: <YOUR KEY HERE>\'')
    print('where <YOUR KEY HERE> is replaced with your key')
    exit()

api.add_resource(GetIngredients, '/get_ingredients')
api.add_resource(AddIngredients, '/add_ingredients')
api.add_resource(RemoveIngredients, '/remove_ingredients')
api.add_resource(GetRecipes, '/get_recipes')
api.add_resource(GetRecipeInfo, '/get_recipe_info');

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
