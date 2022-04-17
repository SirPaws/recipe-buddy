from flask import Flask, render_template
from flask_restful import Api

from rest import GetIngredients, AddIngredients, RemoveIngredients ,GetRecipes
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

# random_joke = "food/jokes/random"
# find = "recipes/findByIngredients"
# randomFind = "recipes/random"

@app.route('/')
def index():
    # joke_response = str(requests.request("GET", url + random_joke, headers=headers).json()['text'])
    return render_template('index.html') #, joke=joke_response)

if __name__ == '__main__':
    app.run(debug=True)
