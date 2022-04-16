from flask import Flask, render_template, request
from flask_restful import Resource, Api

import yaml
import requests
from analyse import Analyse

app = Flask(__name__)
api = Api(app)

# this is for the personal key 
with open('src/key.yaml', 'r') as file:
    rapidapi_privates = yaml.safe_load(file)

if not 'X-RapidAPI-Key' in rapidapi_privates.keys():
    print('this requires a yaml file with your rapid api key!')
    print('create a file in the src directory named \'key.yaml\'')
    print('and then add the line \'X-RapidAPI-Key: <YOUR KEY HERE>\'')
    print('where <YOUR KEY HERE> is replaced with your key')
    exit()

url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/"
headers = {
  'x-rapidapi-host': "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
  'x-rapidapi-key': rapidapi_privates['X-RapidAPI-Key'],
}

api.add_resource(Analyse, '/analyse')

# random_joke = "food/jokes/random"
# find = "recipes/findByIngredients"
# randomFind = "recipes/random"

@app.route('/')
def index():
    # joke_response = str(requests.request("GET", url + random_joke, headers=headers).json()['text'])
    return render_template('index.html') #, joke=joke_response)

if __name__ == '__main__':
    app.run(debug=True)
