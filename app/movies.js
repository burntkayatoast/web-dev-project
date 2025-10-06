var http = require('http')
var url = require('url')
var fs = require('fs')


function search() {
    var query = document.getElementById('query').value
    if (!query) {
        alert('Please enter a movie name')
        return
    }   
    
}