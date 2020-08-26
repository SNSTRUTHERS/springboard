#!/bin/bash

# Using curl, mae a GET request to the icanhazdadjoke.com API to find all jokes involving the word
# "pirate"
curl --get -H "Accept: text/plain" https://icanhazdadjoke.com/search?term=pirate

# Use dig to find what the IP address is for icanhazdadjoke.com
dig https://icanhazdadjoke.com
