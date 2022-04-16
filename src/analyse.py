from flask import request
from flask_restful import Resource

import openfoodfacts
import nltk
import inflect

class Analyse(Resource):

    #HACK(jpm): i have no idea how Resource works, 
    #           so instead of potentially borking it by creating a constructor
    #           we do this instead
    #
    def initialise(self):
        if hasattr(self, 'initialised'): 
            return
        ingredients = openfoodfacts.facets.get_ingredients()
        self.ingredient_names = [ingredient['name'].casefold() for ingredient in ingredients]
        self.word_engine = inflect.engine()
        self.initialised = True

    def process_sentence(self, sentence):
        tokens = nltk.word_tokenize(sentence)
        tagged = nltk.pos_tag(tokens)

        processed_words = []

        for tup in tagged:
            if tup[1] == 'NNS':
                word = word_engine.singular_noun(tup[0])
                processed_words.append(word)
            elif tup[1] == 'NN':
                processed_words.append(tup[0])
            else:
                continue

        words = [word.casefold() for word in processed_words]
        filtered_words = filter(lambda word: word in self.ingredient_names, words)
        filtered_words = list(filtered_words)
        if len(filtered_words) == 0:
            return null
        return filtered_words

    def post(self):
        self.initialise()

        req = request.get_json()

        sentences = []
        for sentence in req:
            process_sentence(sentence)


        return req, 201
