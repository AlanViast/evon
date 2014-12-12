
$ = jQuery.noConflict();

$(document).ready(function(){

        $(document).on(
            'school_selected_redirect',
            function(e, eventinfo) {
                $('.find-schools').submit();
            }
        );

    alphabet_data = [];
    country_data = [];

    filters = {
        country: 'United States',
        state : false,
        type: 'HIGHER'
    };

    $(".country-filter").select2({
        placeholder : "Filter by Country"
    });
    $(".state-filter").select2({
        placeholder : "Filter by State"
    });
    $(".type-filter").select2({
        placeholder : "Filter by type"
    });

    $(".country-filter").on("change", function() {
        filters.country = $(this).val();
        if (filters.country != 'United States') {
            $(".state-filter").select2('val', 'Select US State');
            $(".state-filter").prop('disabled', true);
            filters.state = false;
        }
        else {
            $(".state-filter").prop('disabled', false);
        }
        apply_filters();
    });
    $(".state-filter").on("change", function() {
        var val = $(this).val();
        if (val == '' || val == "Select US State") {
            filters.state = false;
        }
        else {
            $(".country-filter").select2('val','United States');
            filters.country = 'United States';
            filters.state = val;
        }

        apply_filters();
    });
    $(".type-filter").on("change", function() {
        filters.type = $(this).val();
        apply_filters();
    });

    function apply_filters() {
        show_loader();
        $('li.listed-school').hide();
        var location_type = filters.country;
        location_type += filters.state ? filters.state : '';
        location_type += filters.type ? filters.type : '';
        if (typeof country_data[location_type] == 'undefined') {
            var url = '/taxonomy/schools/get_valid_alphabets_for_location.php?school_type='+filters.type+'&country='+filters.country;
            url += filters.state ? '&state='+filters.state : '';
            $.ajax({
                url: url,
                dataType: "json",
                success: function (data) {
                    handle_location_filters(data);
                    country_data[location_type] = data;
                }
            });
        }
        else {
            handle_location_filters(country_data[location_type]);
        }
        return true;
    }

    function handle_location_filters(data) {
        if (typeof data !== 'undefined') {
            hide_loader();
            $('li.listed-school').show();

            if (filters.country) {
                $('li.listed-school').not('li.listed-school[data-country="'+filters.country+'"]').hide();
            }

            if (typeof filters.country == 'string' && filters.country == 'United States' && filters.state) {
                $('li.listed-school').not('li.listed-school[data-state="'+filters.state+'"]').hide();
            }

            if (filters.type) {
                $('li.listed-school').not('li.listed-school[data-type="'+filters.type+'"]').hide();
            }

            if (!$('li.listed-school:visible').length) {
                show_empty();
            }
            $('.alphabet-pagination li').addClass('disabled');

            if (data.length == 0) {
                $('.alphabet-pagination li').addClass('disabled').removeClass('selected');
            }
            else {
                for (var i=0; i< data.length; i++) {
                    $('.alphabet-pagination li[alphabet="'+data[i]+'"]').removeClass('disabled');
                }
            }

        }
        else {
            $('.alphabet-pagination li').addClass('disabled').removeClass('selected');
        }
    }

    function start_loader() {
        $('#widget-header-loader').show();
    }

    function stop_loader() {
        $('#widget-header-loader').hide();
    }

    $('.alphabet-pagination li a').on('click', function(e) {
        e.preventDefault();
        if ($(this).parent().hasClass('disabled')) {
            return false;
        }
        var alphabet = $(this).parent().attr('alphabet');
        select_alphabet(alphabet);
        return false;
    });

    function select_alphabet(alphabet) {
        mark_alphabet_selected(alphabet);

        if (typeof alphabet_data[alphabet] == 'undefined') {
            $('.browse-widget-list').html('');
            show_loader();
            $.ajax({
                url: '/taxonomy/schools/get_schools_for_alphabet.php?alphabet='+alphabet,
                dataType: "json",
                success: function (data) {
                    if (typeof data !== 'undefined' && data.length) {
                        var populated_html = get_populated_html(data);
                        $('.browse-widget-list').html(populated_html);
                        save_current_alphabet_state(alphabet, populated_html);
                        apply_filters();
                    }
                }
            });
        }
        else {
            // not using jquery here because for some reason this is half a second faster
            document.getElementById('browse-list').innerHTML = alphabet_data[alphabet];
            apply_filters();
        }
    }

    function save_current_alphabet_state(alphabet, populated_html) {
        alphabet_data[alphabet] = populated_html;
    }

    function mark_alphabet_selected(alphabet) {
        $('.alphabet-pagination li').removeClass('selected');
        $('.alphabet-pagination li[alphabet="'+alphabet+'"]').addClass('selected');
    }

    function get_populated_html(data) {
        var html = '';
        for (var i=0; i< data.length; i++) {
            html += '<li class="listed-school" data-country="'+data[i].country+'" data-state="'+data[i].state+'" data-type="'+data[i].school_type+'">';
            html += '<h5><a href="'+data[i].url+'">'+ucwords(data[i].school_name)+'</a></h5>';
            html += '<p class="ch-taxonomy-list-resource-summary">';
            html += '<a href="'+data[i].url+'">'+data[i].document_count+' Documents</a>';
            html += '</p></li>';
        }
        return html;
    }

    function show_loader() {
        hide_empty();
        $('.loading-list').css('display', 'block');
    }

    function hide_loader() {
        $('.loading-list').css('display', 'none');
    }

    function show_empty() {
        var $first_available_alphabet_pagination = $('.alphabet-pagination li:not(.disabled):first');
        if ($first_available_alphabet_pagination.length) {
            var alphabet_to_select = $first_available_alphabet_pagination.attr('alphabet');
            select_alphabet(alphabet_to_select);
        }
        else {
            $('.no-listings').css('display', 'block');
        }
    }

    function hide_empty() {
        $('.no-listings').css('display', 'none');
    }

    initial_load = true;
    function reset_filters() {
        filters = {
            country: 'United States',
            state : false,
            type: 'HIGHER'
        };

        $(".country-filter").select2('val','United States');
        $(".state-filter").select2('val', '');
        $(".state-filter").prop('disabled', false);
        $(".type-filter").select2('val', 'HIGHER');
        if (initial_load) {
            setTimeout(function() {select_alphabet('a');}, 500);
            initial_load = false;
        }
        else {
            select_alphabet('a');
        }

        apply_filters();
    }
    reset_filters();

    $('.reset-button').on('click', function(e) {
        e.preventDefault();
        reset_filters();
        return false;
    });
});

function ucwords (str) {
    // From: http://phpjs.org/functions
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Waldo Malqui Silva
    // +   bugfixed by: Onno Marsman
    // +   improved by: Robin
    // +      input by: James (http://www.james-bell.co.uk/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: ucwords('kevin van  zonneveld');
    // *     returns 1: 'Kevin Van  Zonneveld'
    // *     example 2: ucwords('HELLO WORLD');
    // *     returns 2: 'HELLO WORLD'
    return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
        return $1.toUpperCase();
    });
}