function HeaderSearch(){
    this.init = function(){
        var commonSearches = new Bloodhound({
            datumTokenizer: function(d) {
                return d;
            },
            queryTokenizer: function(d) {
                return d;
            },
            remote: {
                url:'//clients1.google.com/complete/search?q=%QUERY&hl=en&client=partner&source=gcsc&partnerid=016272670209538396322%3Amsjgyskl2xq&ds=cse',
                ajax: {
                    dataType: "jsonp"
                },
                filter: function(parsedResponse){
                    var data = parsedResponse[1];
                    for (i = 0; i < data.length; i++) {
                        //google passes things back as an array of arrays just to break typeahead
                        //then typeahead caches a response, but still calls this function, just to break simple logic
                        if (data[i] instanceof Array){
                            data[i] = data[i][0];
                        }
                    }
                    return data;
                }
            }
        });

        commonSearches.initialize();

        jQuery('.ch_h-search-form_input_container .ch_h-search-form_input').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            source: commonSearches.ttAdapter(),
            displayKey: function(d) { return d; }
        });

        jQuery('#homepage_banner_search_input').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            source: commonSearches.ttAdapter(),
            displayKey: function(d) { return d; }
        });


    }
}