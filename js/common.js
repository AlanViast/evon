  $(document).ready(function(){
      $(".clear-context").click(function(){
          var targetId = $(this).data("target");
          $("#" + targetId).val("");
      });
  });
