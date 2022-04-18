from flask import request
from flask_restful import Resource, reqparse

import nltk
import inflect
from spoontacular import Spoontacular
import json
import os

class RestData:
    def __init__(self):
        with open('ingredient_names.json', encoding="utf-8") as json_file:
          ingredients = json.load(json_file)
        self.ingredient_names = [ingredient.casefold() for ingredient in ingredients]

        self.word_engine = inflect.engine()
        self.api = Spoontacular()
        self.initialised = True
        self.file_path = "data/user_ingredients.json" 
        with open(self.file_path, "r") as json_file:
            self.file = json_file
            file_size = os.path.getsize(self.file_path)
            if file_size > 0:
                self.word_list = json.load(self.file)
        self.save()

    def save(self):
        with open(self.file_path, "w+") as json_file:
            json_file.truncate(0)
            json.dump(self.word_list, json_file)

    
    def process_sentence(self, sentence):
        tokens = nltk.word_tokenize(sentence)
        tagged = nltk.pos_tag(tokens)

        processed_tags = []
        for tup in tagged:
            if tup[1] == 'NNP':
                tup = (tup[0], 'NN')
            if len(processed_tags) > 0 and processed_tags[len(processed_tags) - 1][1] == tup[1]:
                index = len(processed_tags) - 1
                current = processed_tags[index]
                processed_tags[index] = (current[0] + ' ' + tup[0], current[1])
                continue
            processed_tags.append(tup)

        processed_words = []
        for tup in processed_tags:
            if tup[1] == 'NNS':
                word = self.word_engine.singular_noun(tup[0])
                if word == False:
                    continue
                processed_words.append(word)
            elif tup[1] == 'NN':
                processed_words.append(tup[0])
            else:
                continue

        if len(processed_words) == 0:
            return None
        processed_words = [word.replace('-', ' ').casefold() for word in processed_words]

        filtered_words = filter(lambda word: word in self.ingredient_names, processed_words)
        filtered_words = list(filtered_words)

        if len(filtered_words) == 0:
            return None
        return filtered_words

_analysis_data = RestData()

class GetIngredients(Resource):
    def get(self):
        return {'id': 'ingredient-list', 'ingredients': _analysis_data.word_list}, 201

class AddIngredients(Resource):
    def post(self):
        req = request.get_json()

        sentences = []
        for sentence in req:
            processed_sentence = _analysis_data.process_sentence(sentence)
            if processed_sentence != None:
                sentences.append(processed_sentence)
        
        if len(sentences) == 0:
            return {'id': 'error', 'message': "could not find any ingredients in sentence"}, 201
        
        for sentence in sentences:
            for word in sentence:
                if not word in _analysis_data.word_list:
                    _analysis_data.word_list.append(word)

        _analysis_data.save()
        return {'id': 'ingredient-list', 'ingredients': _analysis_data.word_list}, 201

class RemoveIngredients(Resource):
    def post(self):
        req = request.get_json()

        sentences = []
        for sentence in req:
            processed_sentence = _analysis_data.process_sentence(sentence)
            if processed_sentence != None:
                sentences.append(processed_sentence)
        
        if len(sentences) == 0:
            return {'id': 'error', 'message': "could not find any ingredients in sentence"}, 400

        for sentence in sentences:
            for word in sentence:
                if word in _analysis_data.word_list:
                    _analysis_data.word_list.remove(word)

        _analysis_data.save()
        return {'id': 'ingredient-list', 'ingredients': _analysis_data.word_list}, 201

class GetRecipes(Resource):
    def get(self):
        text = ','.join(_analysis_data.word_list)
        resp = _analysis_data.api.findRecipeFromIngredients(ingredients= text)
        print('txt')
        print(resp.text)
        print('jsoned')
        print(json.loads(resp.text))
        return {'id': 'recipe-list', 'recipes': json.loads(resp.text)}, resp.status_code

class GetRecipeInfo(Resource):
    def get(self):
        if not 'id' in request.args:
            return {'id': 'error', 'message': "missing recipe id"}, 400

        try:
            recipe_id = int(request.args['id'])
        except ValueError:
            return {'id': 'error', 'message': "invalid recipe id"}, 400
        
        print(recipe_id)

        resp = _analysis_data.api.getRecipeInfo(id=recipe_id)
        if resp.ok:
            data = json.loads(resp.text)
            missing_ingredients = []
            for ingredient in data['extendedIngredients']:
                processed_name = _analysis_data.process_sentence(ingredient['name'])
                if processed_name == None or len(processed_name) == 0:
                    ingredient['processedName'] = ingredient['name']
                    missing_ingredients.append(ingredient)
                    continue
                ingredient['processedName'] = ' '.join(processed_name)
                processed_name = filter(lambda word: word in _analysis_data.word_list, processed_name)
                processed_name = list(processed_name)
                if len(processed_name) == 0:
                    missing_ingredients.append(ingredient)
            data['missingIngredients'] = missing_ingredients
            return {'id': 'recipe-info', 'info': data}, 201
        return {'id': 'error', 'message': "testing error"}, 400
        
