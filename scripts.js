var maxSubmissions = 500;
$body = $("body");

if (getQueryVariable("user") !== null) {
  var username = getQueryVariable("user");
  $("#username").val(username);
}
if (getQueryVariable("max") !== null) {
  maxSubmissions = parseInt(getQueryVariable("max"));
}

$("#goButton").on("click", function() {
  $('#historyTable > tbody').empty();
  $('#mediaTable > tbody').empty();
  $body.addClass("loading");
  var $btn = $(this).button('loading');
  getUserHistory();
  $btn.button('reset');
  $body.removeClass("loading");
});

function getUserHistory() {
  var username = $("#username").val();
  var numberOfPosts = 0;
  var history = {};
  var media = {};
  var url = "https://www.reddit.com/user/" + username + "/submitted.json?limit=100";
  var after = null;
  var hasReachedEnd = false;
  while (!hasReachedEnd) {
    $.ajax({
      url: url + "&after=" + after,
      async: false,
      dataType: 'json',
      success: function(data, status, jqXHR) {
        console.log(jqXHR.responseText);
        var domainData = data.data.children;
        for (var i = 0; i < domainData.length; i++) {
          var domain = domainData[i].data.domain;
          console.log(domain);
          numberOfPosts++;

          if (isNaN(history[domain])) {
            history[domain] = 1;
          } else {
            history[domain] = history[domain] + 1;
          }
          // media stuff - maybe this will come back in the future.
          // if (domainData[i].data.media !== null) {
          //   var mediaData = domainData[i].data.media.oembed.author_name;
          //   var mediaString = domain + " - " + mediaData;
          //   console.log(mediaString);
          //   if (isNaN(media[mediaString])) {
          //     media[mediaString] = 1;
          //   } else {
          //     media[mediaString] = media[mediaString] + 1;
          //   }
          // }
        }
        var maxDomains;
        if (data.data.after !== null && numberOfPosts <= maxSubmissions) {
          after = data.data.after;
          console.log(numberOfPosts);
        } else {
          hasReachedEnd = true;
          maxDomains = 7;
          if (getQueryVariable("maxdomains") !== null) {
            maxDomains = getQueryVariable("maxdomains");
          }
        }
        var iterations = 1;

        //source: http://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
        var items = Object.keys(history).map(function(key) {
          return [key, history[key]];
        });
        items.sort(function(first, second) {
          return second[1] - first[1];
        });
        //domains
        var stop = Math.min(items.length, maxDomains);
        for (var j = 0; j < stop; j++) {
          var item = items[j];
          $("#historyTable tbody").append("<tr><td>" + item[0] + "</td><td>" + item[1] + "</td><td>" + round(100 * (item[1] / numberOfPosts), 2) + "%</td></tr>");
          iterations++;
          if (iterations > maxDomains) {
            items = null;
            data = null;
            history = null;
            iterations = 1;
            $("#totalSubmissions").append(numberOfPosts);
            break;
          }
        }
        //media
        //         var mediaItems = Object.keys(media).map(function(key) {
        //           return [key, media[key]];
        //         });
        //         mediaItems.sort(function(first, second) {
        //           return second[1] - first[1];
        //         });

        //         var stop = Math.min(mediaItems.length, maxDomains);
        //         for (var j = 0; j < stop; j++) {
        //           var item = mediaItems[j];
        //           $("#mediaTable tbody").append("<tr><td>" + item[0] + "</td><td>" + item[1] + "</td><td>" + round(100 * (item[1] / numberOfPosts), 2) + "%</td></tr>")
        //           iterations++;
        //           if (iterations > maxDomains) {
        //             break;
        //           }
        //         }
      }
    });
  }
}

//source: http://www.jacklmoore.com/notes/rounding-in-javascript/
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

//adapted from http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]).toLowerCase() == variable.toLowerCase()) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

//loading modal thing source: http://stackoverflow.com/questions/1964839/how-can-i-create-a-please-wait-loading-animation-using-jquery
