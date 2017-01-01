// Globals
var player, timer, counter, currentTimeIndex, confidence, tayyip_json;

var effects = {
    beep: $('#beep')[0],
    fart: $('#fart')[0],
    'silent-film': $('#silent-film')[0],
    elevator: $('#elevator')[0],
    sitcom: $('#sitcom')[0],
    nature: $('#nature')[0],
    turkiyem: $('#turkiyem')[0],
}
var effectKey = 'mute'
var currentEffect = effects[effectKey];
var loadingScreen = {
    giphys: [
        "https://media.tenor.co/images/42c8cca6caa580022e71aa04c654cb02/tenor.gif",
        "http://i.giphy.com/FhAtceM0UuvJe.gif",
        "http://i.imgur.com/iwK6Siz.png",
        "https://i.makeagif.com/media/7-30-2015/0LmZDq.gif",
        "http://galeri8.uludagsozluk.com/487/al%C4%B1n-amk-satran%C3%A7_546679.gif"
    ],
    init: function() {
        var img = document.getElementById('loading-img')
        img.src = this.giphys[Math.floor(Math.random() * ((this.giphys.length) - 0)) + 0];
        this.el = document.getElementById('loadingWrapper')

    },
    show: function() {
        this.el.className = 'active'
    },
    hide: function() {
        this.el.className = ''
    }
}

// Youtube API
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
    loadVideoFromUrl(function(videoId) {
        initPlayer(videoId)
    })
}

function initPlayer(videoId) {
    player = new YT.Player("player", {
        "height": "360",
        "width": "640",
        "cc_load_policy": 0,
        "showinfo": 0,
        "rel": 0,
        "fs": 0,
        "volume": 100,
        "videoId": videoId,
        "events": {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    })
}

function onPlayerStateChange(event) {
    var rate = tayyip_json.rate
    clearInterval(timer);
    if (currentEffect) {
        currentEffect.pause()
    }
    if (event.data == YT.PlayerState.PLAYING) {
        var currentTime = player.getCurrentTime()
        currentTimeIndex = Math.ceil((currentTime * 1000) / rate)
        timer = setInterval(talking, rate);
    } else if (event.data == YT.PlayerState.ENDED) {
        $('#new-video, .circle').addClass('active')
    }
}

function onPlayerReady() {
    $('.loading-video').remove()
}

var body = document.body
var hits = [];

// Confidence fine tuning
function isHit(confidence) {
    if (confidence > 0.85) {
        hits.push(confidence)
    } else {
        hits.splice(-1, 1);
        return;
    }
    // 10 consecutive confidence # FIND A SWEET SPOT
    if (hits.length < 10) {
        $onAir.removeClass('talking')
        removeEffect()
        return
    } else {
        $onAir.addClass('talking')
        return true
    }
}
$onAir = $('h1.title').find('span')

function talking() {
    currentTimeIndex++;
    confidence = tayyip_json.predictions[currentTimeIndex];

    if (isHit(confidence)) {
        addEffect()
    }
}

function removeEffect() {
    if (currentEffect) {
        currentEffect.pause()
    }
    if (effectKey == 'sitcom') {
        currentEffect.play()
        return
    }
    player.unMute()
}

function addEffect() {
    switch (effectKey) {
        case 'sitcom':
            player.unMute()
            break;
        case 'mute':
            player.mute()
            break;
        default:
            player.mute()
            currentEffect.play()
    }
}

// Main
function showError(msg) {
    var display;
    switch (msg) {
        case 'long':
            display = "Video can't be huge. 20 minutes max.";
            break
        case 'not_found':
            display = "Video not found. It's definitely PARALEL YAPI's fault.";
            break
        default:
            display = "Something went wrong, I bet it's FETO.";

    }
    var error = document.getElementById('error')
    error.style.visibility = "visible"
    error.innerHTML = display
}

function loadVideoFromUrl(callback) {
    var videoId = window.location.hash.replace("#", "")
    if (!videoId) {
        videoId = "popular"
    }

    $.getJSON('api/videos/' + videoId, function(json) {
        if (json.state === 'not_found') {
            showError('not_found')
        } else if (json.delayed) {
            runPolling(videoId)
        } else if (json.is_too_long) {
            showError('long')
        } else {
            updateTayyipJson(json)
            callback(tayyip_json.youtube_id)
            clearInput()
        }
    })
}

function updateTayyipJson(json) {
    tayyip_json = json
    tayyip_json.predictions = JSON.parse(json.predictions)
}

function runPolling(videoId) {
    var poll;
    var stopPoll = function() {
        loadingScreen.hide()
        clearInterval(poll)
        clearInput()
    }

    loadingScreen.show()

    var poll = setInterval(function() {
        $.getJSON('api/videos/' + videoId + "/poll", function(video) {
            switch (video.state) {
                case "not_ready":
                    return
                case 'too_long':
                    stopPoll()
                    showError('long')
                    return
                case 'not_found':
                    stopPoll()
                    showError('not_found')
                    return
                default:
                    updateTayyipJson(video)

                    if (!player) {
                        initPlayer(video.youtube_id)
                    } else {
                        player.loadVideoById(video.youtube_id)
                    }

                    stopPoll()
            }
        }).fail(function() {
            showError()
            clearInterval(poll)
            loadingScreen.hide()
        })
    }, 2000)
}

function clearInput() {
    $('#new-video-input').val("")
}

// Emoji buttons
$('.column.' + effectKey).addClass('active');

Object.keys(effects).forEach(function(audio) {
    effects[audio].volume = 0.4
})

$('.column').click(function(e) {
    $column = $('.column').removeClass('active')
    $(this).addClass('active')
    if (currentEffect) {
        currentEffect.pause()
    }
    effectKey = $(this).data("effect")
    currentEffect = effects[effectKey]
})

// Entry point
$(window).on('hashchange', function() {
    loadVideoFromUrl(function(youtubeId) {
        player.loadVideoById(youtubeId)
        player.setVolume(100)
        player.unMute()
    })
});

$(document).ready(function() {
    loadingScreen.init()
})