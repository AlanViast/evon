$ = jQuery.noConflict();

$(document).ready(function(){

    school_selection = {
        school : false,
        dept : false,
        course : false
    };

    category_selection = {
        category_id : 0,
        category_type : null,
        category_name : null
    };

    $('body').on('school_sel_validation_failed', function() {
        school_selection = {
            school : false,
            dept : false,
            course : false
        };
        make_find_button_inactive();
    });

    function set_category_selection(e) {
        category_selection.category_id=e.detail.object_id;
        category_selection.category_name=e.detail.object_name;
        category_selection.category_type=e.detail.type;
        if(category_selection.category_type=='book_title') {
            category_selection.category_type='book';
        }
        else if (category_selection.category_type=='test') {
            category_selection.category_type='standardized_test';
        }

        setup_go();
    }

    function set_school_selection(hyphenized_val) {
        school_selection.school = hyphenized_val;
        school_selection.dept = false;
        school_selection.course = false;
        setup_go();
    }

    function set_dept_selection(hyphenized_val) {
        school_selection.dept = hyphenized_val;
        school_selection.course = false;
        setup_go();
    }

    var $deptSelect = $('select.department-select');
    var $courseSelect = $(".course-select");

    $deptSelect.select2({
        placeholder : "Dept."
    });

    $courseSelect.select2({
        placeholder : "Course"
    });

    function get_hyphenized(id, val) {
        if (typeof val == 'undefined' || val == null) {
            return false;
        }
        else {
            return id + '-' + val.replace(new RegExp(" ", "g"), '-');
        }
    }

    function reset_courses_dropdown() {
        $courseSelect.html('<option></option>');
        $courseSelect.attr('placeholder', 'Course').select2();
        $courseSelect.prop('disabled', true);
    }

    function reset_dept_dropdown() {
        $deptSelect.html('<option></option>');
        $deptSelect.attr('placeholder', 'Dept.').select2();
        $deptSelect.prop('disabled', true);
    }

    function make_find_button_active() {
        $('#taxonomy-header-go').removeClass('disabled');
    }

    function make_find_button_inactive() {
        $('#taxonomy-header-go').addClass('disabled');
    }

    $(document).on(
        'autocomplete_selection_header',
        function(e, eventinfo) {
            autocomplete_selection_header_event_handler(eventinfo)
        }
    );

    function autocomplete_selection_header_event_handler(e) {
        make_find_button_active();
        reset_courses_dropdown();
        reset_dept_dropdown();

//        console.log("autocomplete_selection_header_event_handler "+e.detail.type);
        if (typeof e !== 'undefined' &&
            typeof e.detail !== 'undefined' &&
            typeof e.detail.object_id !== 'undefined' &&
            typeof e.detail.type !== 'undefined' &&
            typeof e.detail.object_name !== 'undefined' &&
            e.detail.type == 'school') {

            var school_id = e.detail.object_id;
            set_school_selection(get_hyphenized(school_id, e.detail.object_name));
            $.ajax({
                url:"/ajax/autocomplete_resultset.php?type=departments_for_school&term=%&school="+school_id,
                dataType: "json",
                success: function (data) {
//                    console.log("success"+data.length);
                    if (typeof data !== 'undefined' && data.length) {
                        var options = '<option></option>';
                        for (var i=0; i< data.length; i++) {
                            options += '<option value="'+data[i].id+'">'+data[i].label+'</option>';
                        }
                        $courseSelect.html('');

                        $deptSelect.prop('disabled', false);
                        $deptSelect.html(options);
                        $deptSelect.select2('data', null);
                        $deptSelect.attr('placeholder', 'Dept.').select2();
                        populateCourses(school_id, $deptSelect.attr('value'));

                        $deptSelect.on('change', function() {
                            var dept_acro = $(this).find('option[value="'+$(this).attr('value')+'"]').html();
                            var val = $(this).attr('value');
                            if (val == '') {

                            }
                            else {
                                set_dept_selection(get_hyphenized(val, dept_acro));
                                populateCourses(school_id, val);
                            }
                        })
                    }
                }
            });
        }
        if (typeof e !== 'undefined' &&
            typeof e.detail !== 'undefined' &&
            typeof e.detail.object_id !== 'undefined' &&
            typeof e.detail.type !== 'undefined' &&
            typeof e.detail.object_name !== 'undefined' &&
            (e.detail.type == 'subject' || e.detail.type == 'test' || e.detail.type == 'book_title')) {
                set_category_selection(e);
        }
    }


    function populateCourses(school_id, dept_id) {
        $courseSelect.prop('disabled', true);
        $courseSelect.html('<option></option>');
        $courseSelect.select2({
            placeholder : "Course"
        });
        $.ajax({
            url:"/ajax/autocomplete_resultset.php?type=courses_for_school_department&term=%&school="+school_id+"&dept="+dept_id,
            dataType: "json",
            success: function (data) {
                if (typeof data !== 'undefined' && data.length) {
                    var options = '<option></option>';
                    for (var i=0; i< data.length; i++) {
                        options += '<option value="'+data[i].id+'">'+data[i].label+'</option>';
                    }
                    $courseSelect.prop('disabled', false);
                    $courseSelect.html(options);

                    $courseSelect.select2('data', null);
                    $courseSelect.attr('placeholder', 'Course').select2();

                    $courseSelect.on('change', function() {
                        school_selection.course = get_hyphenized($courseSelect.attr('value'), $courseSelect.find('option[value="'+$courseSelect.attr('value')+'"]').html());
                        setup_go();
                        $('#taxonomy-course-to-follow').removeClass("disabled");
                        $('#taxonomy-course-to-follow').addClass("enabled");
                    })
                }
            }
        });
    }

    function setup_go() {
        var redirect_url = '/sitemap/schools/';
        redirect_url += typeof school_selection.school == 'string' ? school_selection.school+'/' : '';

        if (typeof school_selection.course == 'string') {
            redirect_url += 'courses/' + school_selection.course + '/';
        }
        else if (typeof school_selection.dept == 'string') {
            redirect_url += 'departments/' + school_selection.dept + '/';
        }

        $('#taxonomy-header-go').attr('href', redirect_url);
        return true;
    }

    $('#taxonomy-header-go').on('click', function(e) {
        if (!school_selection.school) {
            e.preventDefault();
            return false;
        }
        return true;
    });

    $('.clear-school').on('click', function(e) {
        e.preventDefault();
        reset_all();
        return false;
    });

    function reset_all() {
        school_selection = {
            school : false,
            dept : false,
            course : false
        };

        reset_courses_dropdown();
        reset_dept_dropdown();
        $('#school_sel_show').val('');
        $('#school_sel').val('');
    }
    reset_all();
});

function setupLiterary(){
        function bookFormatResult(book) {
            var title = book.title;

            if (book.use_alias == 1){
                title = book.alias;
            }
            var markup = "<table class='book-result'><tr>";
            markup += "<td class='book-image'><img src='" + book.thumbnail + "'/></td>";
            markup += "<td class='book-info'><div class='book-title'><h5>" + title + "</h5></div>";
            markup += "<div class='book-author'>" + book.author +"</div>";
            markup += "</td></tr></table>";
            return markup;
        }

        function bookFormatSelection(book) {
            window.location = "/books/"+book.hyphenized_title+"/";
            return book.title;
        }
        $("#book-sel").select2({
            placeholder: "Search for a book or author",
            minimumInputLength: 2,
            allowClear:true,
            ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                url: "/ajax/autocomplete_resultset.php?type=book",
                dataType: 'json',
                data: function (term, page) {
                    return {
                        term: term, // search term
                    };
                },
                results: function (data, page) { // parse the results into the format expected by Select2.
                    return { results: data };
                }
            },
            formatResult: bookFormatResult, // omitted for brevity, see the source of this page
            formatSelection: bookFormatSelection,  // omitted for brevity, see the source of this page
            escapeMarkup: function (m) { return m; }
        });
}
