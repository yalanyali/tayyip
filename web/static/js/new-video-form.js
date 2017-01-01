var $newVideoForm = $('#new-video')
var $plusButton = $('.plusWrapper').find('.plus')
var $earButton = $('.plusWrapper').find('.ear')

$plusButton.click(function() {
  searchToggle()
})

$earButton.click(function() {
  $newVideoForm.submit()
})

var searchToggle = function() {
  $newVideoForm.toggleClass('active')
  $plusButton.toggleClass('active')
  $earButton.toggleClass('active')
  $('#new-video-input').focus()
}

var validateYoutubeUrl = function(youtubeUrl) {
  if (youtubeUrl && youtubeUrl.match(/^http(s?).*\.com\/watch\?v=.{11}$/)) {
    return true
  }
  return false
}

$newVideoForm.submit(function(e) {
  e.preventDefault()
  var inputValue, id, goTo
  inputValue = $('#new-video-input').val()

  if (validateYoutubeUrl(inputValue)) {
    id = inputValue.split("v=")[1]
    window.location.href = "#" + id
    searchToggle()
  }
})

// Playlist
function renderPlaylist() {
  $playlist_content = $('.playlist').find('.contents')
  $.getJSON('/api/videos/playlist', function(playlist) {
    content = ""
    Object.keys(playlist).forEach(function(key) {
      var vidId = playlist[key][0]
      var imgUrl = playlist[key][1]
      content += "<div class='video'><a href='#" + vidId + "'><img src='" + imgUrl + "'/></a></div>"
    })
    $playlist_content.html(content)

    $('.video').click(function() {
      renderPlaylist()
    })
  })
}

renderPlaylist()

$('.loadMore').click(function() {
  renderPlaylist()
})