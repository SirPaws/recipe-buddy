# recipe-buddy



# setup
```cmd
py -3 -m venv venv
pip3 install -r .\requirements.txt
``` 
next you need to create a yaml file in the `src` directory
this file **has** to be named **key.yaml**.
in this file you need to put the following
```yaml
X-RapidAPI-Key: <YOUR KEY HERE>
```
where `<YOUR KEY HERE>` is your own rapid api key
check the [example](https://rapidapi.com/spoonacular/api/recipe-food-nutrition/) on their website

also this project relies on nltk so you need to set that up as well.
to do that open up a python shell and type
```py
>>> import nltk
>>> nltk.download()
```


