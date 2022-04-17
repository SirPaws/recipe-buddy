from flask import request
from flask_restful import Resource

import openfoodfacts
import nltk
import inflect
from spoontacular import Spoontacular
import json

class RestData:
    def __init__(self):
        with open('ingredient_names.json', encoding="utf-8") as json_file:
          ingredients = json.load(json_file)
        self.ingredient_names = [ingredient.casefold() for ingredient in ingredients]

        self.word_engine = inflect.engine()
        self.api = Spoontacular()
        self.initialised = True
        self.word_list = []
    
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
        return {'message': 'okay', 'ingredients': _analysis_data.word_list}, 201

class AddIngredients(Resource):
    def post(self):
        req = request.get_json()

        sentences = []
        for sentence in req:
            processed_sentence = _analysis_data.process_sentence(sentence)
            if processed_sentence != None:
                sentences.append(processed_sentence)
        
        if len(sentences) == 0:
            return {'message': "could not find any ingredients in sentence", 'ingredients': _analysis_data.word_list}, 404
        
        for sentence in sentences:
            for word in sentence:
                if not word in _analysis_data.word_list:
                    _analysis_data.word_list.append(word)

        return {'message': 'okay', 'ingredients': _analysis_data.word_list}, 201

class RemoveIngredients(Resource):
    def post(self):
        req = request.get_json()

        sentences = []
        for sentence in req:
            processed_sentence = _analysis_data.process_sentence(sentence)
            if processed_sentence != None:
                sentences.append(processed_sentence)
        
        #TODO(jpm): actually figure out what would be a correct status code
        if len(sentences) == 0:
            return {'message': "could not find any ingredients in sentence", 'ingredients': _analysis_data.word_list}, 404

        for sentence in sentences:
            for word in sentence:
                if word in _analysis_data.word_list:
                    _analysis_data.word_list.remove(word)

        return {'message': 'okay', 'ingredients': _analysis_data.word_list}, 201

class GetRecipes(Resource):
    def get(self):
        text = ','.join(_analysis_data.word_list)
        resp = _analysis_data.api.findRecipeFromIngredients(ingredients= text)
        print('txt')
        print(resp.text)
        print('jsoned')
        print(json.loads(resp.text))
        return json.loads(resp.text), resp.status_code
