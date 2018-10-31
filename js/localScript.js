window.onload = () => {
    getAllPlaylists(start = true);
    $('#addAsongCaller').bind("click", function () {
        addPlaylistForm('add');
    });
};
$(window).on('resize', function () {
    curvedTitle();
});
let counter = 0;
let shlomi = true;


$('#minimizePlayer').click(function () {
    /// minimize media player if displayed and show it if not - without muting.
    if ($('.playerCont').css("display") == "block") {
        $('.playerCont').hide();
        $('.playerWrapper').attr("class", "playerWrapper no-height");
        $('#minimizePlayer').html("Big_");
    } else {
        $('.playerCont').show();
        $('.playerWrapper').attr("class", "playerWrapper");
        $('#minimizePlayer').html("Min_");
    }
    ;
});
/// bind our playlist songs buttons functions
function playerButtonsAnimationsActivation(audioSourceDiv) { ///give our disk some power
    songButtonsModifying(audioSourceDiv);///let player have click function to control play
    audioSourceDiv.unbind('playing');//bind playing to trigger for look of disk and list item
    audioSourceDiv.bind('playing', function (e) {
        $('.diskHolder img').css({
            "animation": "rotating 1000ms linear",
            "animation-iteration-count": "infinite"
        });
        $('.pulsate-x1').css("display", "block");
        $('#playerDiskPauseBTN').attr("class", "fas fa-pause");
        $($('.active-song i')[0]).attr("class", "active-song fas fa-pause");
    });
    audioSourceDiv.unbind('pause');
    audioSourceDiv.bind('pause', function (e) {
        $('.pulsate-x1').css("display", "none");
        $('.diskHolder img').css("animation", "off");
        $('#playerDiskPauseBTN').attr("class", "fas fa-play");
        $($('.active-song i')[0]).attr("class", "active-song fas fa-play");
    });
}
;

//function check if playing and pause if does
function pauseIfPlaying() {
    let playing = ($('#playerAudioTag')[0].currentTime > 0 && !$('#playerAudioTag')[0].paused && !$('#playerAudioTag')[0].ended);
    if (playing) {
        $('#playerAudioTag')[0].pause();
    }
    ;
};


// first time played a song, modify our player to look good in universal way.
function playerModifying(audioSourceDiv) {
    audioSourceDiv.mediaelementplayer({
        "audioVolume": "vertical",
        success: function (mediaElement) {
            let playPromise = audioSourceDiv[0].play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Automatic playback started!
                    audioSourceDiv[0].pause();
                    audioSourceDiv[0].currentTime = 0;
                    audioSourceDiv[0].play();
                });
            }
        }
    });
    let marquee = $('ul.playerSongNameUL');
    let mar = $('ul.playerSongNameUL li');
    let indent = 190;
    setInterval(function () {
        indent--;
        mar.css('text-indent', indent);
        if (indent < -1 * 130) {
            indent = 190;
        }
        ;
    }, 14);
}

// set player our current playlist image and relevant (delete and edit) buttons data
function setPlayerImageAndButtons(playlistArray) {
    let playlist = playlistArray[0];
    $('.diskHolder img').attr("src", `${playlist.image}`);
    $('#hidePlayer')[0].dataset.name = playlist.name;
    $('.playerSideButtons .fa-times-circle').attr("onclick", `deletionModal(${true});`).attr("data-id", playlist.id);
    $('.playerSideButtons .circle-for-fa-pen').attr({
        onclick: 'editOptionsModal(this,newEdit=true)',
        'data-id': playlist.id,
        'data-name': playlist.name,
        'data-img': playlist.image,

    });
}
;

/// once song triggered makes all the songs have index and remove what not need to be for one chosen
function preActivePlayer(it) {
    if (!($(it).attr("class") == "active-song")) {
        pauseIfPlaying();
    }
    ;
    let objectStringified = it.dataset.blah;
    let objectParsed = JSON.parse(objectStringified);
    let theType = $($('.playerPlaylistSongNames')[0]).children("li");
    let clickedSong = $(theType[objectParsed.i]);
    $(theType).each(function (i, li) {
        if (!(i === objectParsed.i)) {
            $(li).children("i").remove();
            $(li).attr("class", "");
            $(li).children("span").show();
        }
        ;
    });
    activePlayer(objectParsed.song, objectParsed.i);
};

/// replace song, hit play, give active-song play button and modifying by calling functions
function activePlayer(song, i) {
    let clickedSong = $($($('.playerPlaylistSongNames')[0]).children("li")[i]);
    let audioSourceDiv = $('#playerAudioTag');
    //check there is really need to change song and not just stop it as already happened as binded functions.
    if (!(clickedSong.attr("class") == "active-song")) {
        //if not already active song, make him active, hide number(span) and prepend play button;
        clickedSong.attr("class", "active-song");
        clickedSong.children("span").hide();
        clickedSong.prepend(`<i class="fas fa-play">&nbsp;</i>`);
        //// replace src
        audioSourceDiv.empty();
        audioSourceDiv.append(`<source src="${song.url}"/>`);
        ;
        // restart playing. if first play(counter) it will open player firstly. else it will hit the play button.
        if (counter === 0 && shlomi === true) {
            playerModifying($('#playerAudioTag'));
            shlomi = false;
        } else {
            let playing = (audioSourceDiv[0].currentTime > 0 && !audioSourceDiv[0].paused && !audioSourceDiv[0].ended);
            if (!playing) {
                audioSourceDiv[0].currentTime = 0;
                audioSourceDiv[0].play();
            }
            ;
        }
        ;
        $('#playerCurrentSongName').html(`NOW PLAYING:&nbsp;${song.name}`);
        setTimeout(function () {
            ///change title by name;
            $($('title')[0]).html(`${$('#hidePlayer')[0].dataset.name} - ${song.name}`);
        }, 30);
        ///animations binding for play and pause buttons.
        playerButtonsAnimationsActivation(audioSourceDiv);
        //bind ended to trigger for look of disk and list item + next song
        audioSourceDiv.unbind('ended');
        audioSourceDiv.bind('ended', function (e) {
            console.log('bind - ended');
            let theType = $($('.playerPlaylistSongNames')[0]).children("li");
            if (!(theType.length === i + 1)) {
                //not last song - play next
                $(theType[i + 1]).trigger("onclick");
            }
            ;
            counter++;
            $('#songsPlayed span').html(counter);
        });
    }
    ;
}
;
// close player mute and hide..
let closePlayer = function () {
    pauseIfPlaying();
    $('.playerWrapper').hide();
    $($('title')[0]).html("My Awesome Player");
};

//// open new playlist - replace sources
function openPlayer(playlistID, songsArray) {
    closePlayer();
    $('#hidePlayer').bind("click", closePlayer);
    $($('.playerPlaylistSongNames')[0]).empty();
    $(songsArray).each(function (i, song) {
        $($('.playerPlaylistSongNames')[0]).append(`<li data-blah=${JSON.stringify({song: song, i: i})} onclick="preActivePlayer(this);" ><span>&nbsp;${i + 1}.</span>${song.name}</li>`);
    });
    $('.playerWrapper').show();
    let that = $($('.playerPlaylistSongNames')[0]).children("li")[0];
    preActivePlayer(that);
}
;


/// modifying mediaplayer buttons binding-last
function songButtonsModifying(audioSourceDiv) {
    $('#playerDiskPauseBTN').bind("click", btn_playing);
    $($('.active-song i')[0]).bind("click", btn_playing);
}
;

let btn_playing = function () {
    $('#playerAudioTag')[0].pause();
    $('#playerDiskPauseBTN').unbind("click", btn_playing);
    $($('.active-song i')[0]).unbind("click", btn_playing);
    $('#playerDiskPauseBTN').bind("click", btn_pausing);
    $($('.active-song i')[0]).bind("click", btn_pausing);
};
let btn_pausing = function () {
    $('#playerAudioTag')[0].play();
    $('#playerDiskPauseBTN').unbind("click", btn_pausing);
    $($('.active-song i')[0]).unbind("click", btn_pausing);
    $('#playerDiskPauseBTN').bind("click", btn_playing);
    $($('.active-song i')[0]).bind("click", btn_playing);
};


///applying via CircleType Plugin our Playlists name radius to apply around disks
function curvedTitle() {
    let win = $(this); //this = window
    let playlistsTitles = $('.h2Playlist');
    let currRadius = 0;
    if (win.width() >= 820) {
        currRadius = 142;
    } else {
        currRadius = 137;
    }
    playlistsTitles.each((i, title) => {
        new CircleType(title).radius(currRadius);
    });
}
;

// function to append our playlist html once got data from DB
function appendPlaylistToDOM(playlistArray, empty = false, start = false) {
    if (empty) {
        $('#playlistWrapper').empty();
    }
    ;
    if ($(playlistArray[0]).length > 0) {
        $(playlistArray[0]).each(function (i, playlist) {
            $('#playlistWrapper').append(`
                    <div data-id=${playlist.id} class="col-sm-6 col-md-3 col-xs-12 albumCountainer">
                        <div class="playlistInner">
                            <div class="playlistTitle">
                                <h2 class="h2Playlist">${playlist.name}</h2>
                            </div>
                            <div class="diskImg">
                                <img src="${playlist.image}" alt="${playlist.name} Playlist Image" />
                                <i onclick="getPlaylistSongs(${playlist.id});" class="imgPlay fas fa-play"></i>
                                <i onclick="deletionModal(${playlist.id});" class="imgDelete fas fa-times"></i>
                                <i data-id="${playlist.id}" data-name="${playlist.name}" data-img="${playlist.image}" onclick="editOptionsModal(this,newEdit=true);" class="imgEdit fas fa-pen"></i>
                            </div>
                        </div>
                    </div>`);
        });
        curvedTitle();
    } else {
        if (!(start)) {
            ///empty, no songs found. - for search.
            $('#playlistWrapper').append(`<div>Couldn't Find Any Match..</div>`);
        }
        ;
    }
    ;
    if (start) {
        $('#loading').hide();
    }
    ;
}
;

// calling deletionModal when pressing delete icon
function deletionModal(id) {
    //activate modal
    $('#localModal').modal({backdrop: 'static', keyboard: false});
    //customize
    $($('.modal-title')[0]).html(`Confirm Delete`);
    $($('.modal-body')[0]).html(`<p style="padding-left:15px;">Are You Sure you want to Procceed?</p>`);
    $($('.modal-footer')[0]).html(`
                        <button onclick="approveDelete(${id});" type="button" class="btn btn-danger" autofocus="autofocus">Delete</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`);
    $($('.modal-footer')[0]).show();
}
;


// if chosen to delete in modal, call Db for recent update.
function approveDelete(id) {
    if (id === true) {
        /// close media player if chose to delete current playlist
        closePlayer();
        id = $('.playerSideButtons .fa-times-circle')[0].dataset.id;
    }
    ;
    $.ajax({
        url: `api/playlist.php?type=playlist&id=${id}`,
        type: "DELETE",
        success: function (data) {
            getAllPlaylists();
            $('#localModal').modal('hide');
        }
    });
}


// get All playlists from Db when start or delete a playlist , and call append in Doc Func
function getAllPlaylists(start = false) {
    $.ajax({
        url: `api/playlist.php?type=playlist`,
        type: "GET",
        success: function (data) {
            let playlistArray = [data.data];
            appendPlaylistToDOM(playlistArray, empty = true, start);
        }
    });
}
;

// get Specific playlist from Db after adding a playlist and call append in Doc Func
function getSpecificPlaylist(id, callbackFuncs) {
    $.ajax({
        url: `api/playlist.php?type=playlist&id=${id}`,
        type: "GET",
        success: function (data) {
            let playlistArray = [data.data];
            callbackFuncs(playlistArray);
        }
    });
}
;

// Function to append in Doc Form of adding a new playlist
function addPlaylistForm(currCase) {
    let button;
    let title;
    let existName = "";
    let existImg = "";
    switch (currCase) {
        case 'add':
            button = `<button id='nextBTN' type="button" class="btn btn-orange" onclick="preAttachPlaylistSongs('add');">Next</button>`;
            title = `Add New Playlist`;
            letGoNextImage = false;
            break;
        case 'edit':
            existName = $('#loading').attr("data-name");
            existImg = $('#loading').attr("data-img");
            button = `<button id='saveUpdPnameBTN' type="button" class="btn btn-orange" onclick="preAttachPlaylistSongs('edit');">Save</button>`;
            title = `<i onclick='editOptionsModal()' class="iForUndoEdit fas fa-undo"></i>&nbsp;Edit Playlist - ${existName}`;
            letGoNextImage = true;
            break;

    }
    ;
    $('#localModal').modal({backdrop: 'static', keyboard: false});
    $($('.modal-title')[0]).html(`${title}`);
    $($('.modal-body')[0]).html(`
                <div class="addPlaylistModalForm col-xs-8 col-md-4">
                  <form>
                    <div class="form-group">
                      <label>Playlist Name</label>
                      <input id="playlistNameupload" type="text" class="form-control" placeholder="e.g. Asking Alexandria"  value="${existName}" onblur="checkPlaylistNameOnBl(this);"/>
                    <div class="errMsg" id="errForPLNameIn"></div>
                    </div>
                    <div class="form-group">
                      <label>Playlist Image URL</label>
                      <input id="playlistURLupload" type="text" class="form-control"
                      placeholder="http://" onblur="checkImageURLValidation(this);" value="${existImg}"/>
                      <div class="errMsg" id="imgURLerr">
                      </div>
                    </div>
                    <div class="row">
                      ${button}
                      <button id="ResetFieldsBTN" type="button" class="btn btn-orange"
                      onclick="clearAddPlaylistForm();">Reset Fields</button>
                    </div >
                  </form >
                </div >
          <div class="previewImageOfModalCont col-xs-4 col-md-4 form-group">
            <div id="addPlaylistPreviewImageDiv"></div>
            <img id="addPlaylistPreviewImage" src="" alt="Preview Image" />
          </div>`);
    $($('.modal-footer')[0]).html(`<div class="errMsg form-control" id="playlistDeclareFormErr">`);
    $($('.modal-footer')[0]).hide();
    if (currCase == 'edit') {
        checkImageURLValidation($('#playlistURLupload'));
    }
    ;
}
;

// Check playlist image URL onblur ,  check end of URL and call it to check if exists
function checkImageURLValidation(inputField) {
    let URL = $(inputField).val();
    if (URL.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        /// url end match.
        /// try to get a callback to see if exists.
        $.get(URL)
                .done(function () {
                    // image exists
                    letGoNextImage = true;
                    $('#addPlaylistPreviewImage').attr("src", URL);
                    $('#addPlaylistPreviewImageDiv').hide();
                    $('#addPlaylistPreviewImage').show();
                })
                .fail(function () {
                    // Image doesn't exist - do something else.
                    errGenerator("imgURLerr", "URL image provided is broken");
                    resetAddPlaylistImage();
                })
    } else {
        errGenerator("imgURLerr", "URL provided is not an image");
        resetAddPlaylistImage();
    };
};

//check onblur name for err generate if neeeded
function checkPlaylistNameOnBl(input) {
    if (!($(input).val().length > 0)) {
        errGenerator("errForPLNameIn", "Playlist must have a name.");
    } else {
        $('#errForPLNameIn').hide();
    } ;
};

// if image Url is wrong, display empty div instead of broken image url
function resetAddPlaylistImage() {
    letGoNextImage = false;
    $('#addPlaylistPreviewImageDiv').show();
    $('#addPlaylistPreviewImage').hide();
    $('#addPlaylistPreviewImage').attr("src", "");
}
;

// called by reset fields BTN - clears playlist form - called by reset fields in add playlist modal
function clearAddPlaylistForm() {
    let formInputsArray = [$('#playlistURLupload'), $('#playlistNameupload')];
    clearForm(formInputsArray);
    resetAddPlaylistImage();
}
;

//  called by Next BTN - before confirming playlist and moving to adding a songs validations. called by Next BTN
function preAttachPlaylistSongs(currCase) {
    let playlistID = $('#loading').attr("data-id");
    //check if form is ok.
    let playlistName = $('#playlistNameupload').val();
    let formOk = (letGoNextImage && playlistName.length > 0);
    if (formOk) {
        let playlistImageURL = $('#playlistURLupload').val();
        if (currCase == 'add') {
            addPlaylistSongsModal(playlistName, playlistImageURL);
        } else if ((currCase == 'edit')) {
            updatePlaylistNameImage(playlistID, playlistName, playlistImageURL);
        }
        ;
    } else {
        checkPlaylistNameOnBl($('#playlistNameupload'));
        checkImageURLValidation($('#playlistURLupload'));
        $($('.modal-footer')[0]).show();
        errGenerator("playlistDeclareFormErr", "Please Fill the fields correctly.");
        setTimeout(() => {
            $($('.modal-footer')[0]).hide();
        }, 2000)
    }
    ;
}
;

// append in doc modal for adding or editing our playlist songs
function addPlaylistSongsModal(playlistName, playlistImageURL, edit = false) {
    let title = "";
    if (!edit) {
        //add
        title = "Add Playlist Songs";
    } else {
        //edit
        title = `<i onclick='editOptionsModal()' class="iForUndoEdit fas fa-undo"></i>&nbsp;Edit Playlist Songs - ${playlistName}`;
    }
    let songCounter = 1;
    $($('.modal-title')[0]).html(title);
    $($('.modal-body')[0]).html(`
                    <div class="songsWrapper addingSongs">

                  <div class="songAddRow">
                    <i onclick="deleteSongAddRow(this)" class="deleteSongAddRow fas fa-times"></i>&nbsp;
                    <ul class="navbar-nav">
                      <li class="songAddLi nav-item">Song URL&nbsp;</li>
                    </ul>
                    <input data-legit="${false}" data-songNum="${songCounter}" onblur="checkMP3url(this);" class="songAddInputLeft" type="text"
                    placeholder="http:// .mp3" />
                    <label>Name:&nbsp;</label>
                    <input onblur="inputValLengthCheck(this);" class="songAddInput" type="text" />
                  </div>
                  <div class="form-control errMsg" id="${songCounter}songErr"></div> 

                </div>

                <div class="addingSongsControlButtons addingSongs">
                  <nav class="navbar navbar-expand-sm row">
                    <ul class="navbar-nav mr-auto">
                      <li class="nav-item">
                        <i onclick="addAnotherSongBTN();" class="addStyleButton fas fa-plus-square"></i>
                        Add another song</li>
                    </ul>
                    <form class="formBTNCont">
                      <button id="" type="button" class="btn btn-orange" onclick="savePlaylistAndSongs(${edit});">FINISH & SAVE</button>
                    </form>
                  </nav>
                </div>
                <div class="form-control errMsg" id="addPlaylistSongsMasterErr"></div>
                <input id="addingSongsCounter" type="hidden" readonly value="${songCounter}"/>
                <input id="currentPlaylistData"  data-playname="${playlistName}"
                data-playimg="${playlistImageURL}" type="hidden" readonly/>
        `);
    $($('.modal-footer')[0]).html(`<div class="errMsg form-control" id="playlistSongsFormErr">`);
    $($('.modal-footer')[0]).hide();
}
;

/// check MP3url onblur event -  set dataset with true or false if ok - checks type, url and call it to check its actually - audio/mpeg file
function checkMP3url(input) {
    let number = input.dataset.songnum;
    let mp3URL = $(input).val();
    let URLPattern = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    let mp3End = /\.(?:wav|mp3)$/i;
    /// check format 
    if (mp3URL.match(URLPattern) && mp3URL.match(mp3End)) {
        /// try to get a callback to see if header content is audio/mpeg file.
        let x = new XMLHttpRequest();
        x.onreadystatechange = handler;
        x.open('GET', mp3URL, true);
        x.send();
        function handler() {
            if (x.status === 200) {
                let contentType = this.getResponseHeader('content-type');
                if (contentType == "audio/mpeg") {
                    //good - header content is fine
                    $(input).css("border", "1px solid lightgray");
                    $(`${number}songErr`).hide();
                    input.dataset.legit = true;
                } else {
                    //header content is wrong
                    $(input).css("border", "3px solid red");
                    errGenerator(`${number}songErr`, "URL provided is not audio/mpeg content");
                    input.dataset.legit = false;
                }
            } else {
                ///couldn't communicate the server.
                if (!(x.status === 0)) {
                    $(input).css("border", "3px solid red");
                    errGenerator(`${number}songErr`, "couldn't communicate URL server");
                    input.dataset.legit = false;
                }
                ;
            }
        }
        ;
    } else {
        /// not mp3 end
        $(input).css("border", "3px solid red");
        errGenerator(`${number}songErr`, "URL provided is not mp3");
        input.dataset.legit = false;
    }
}
;

/// add another song button append a row onclick event 
function addAnotherSongBTN(edit = false, song) {
    let num = parseInt($('#addingSongsCounter').val());
    $('#addingSongsCounter').val(num + 1);
    $($('.songsWrapper')[0]).append(`
                  <div class="songAddRow">
                    <i onclick="deleteSongAddRow(this)" class="deleteSongAddRow fas fa-times"></i>&nbsp;
                    <ul class="navbar-nav">
                      <li class="songAddLi nav-item">Song URL&nbsp;</li>
                    </ul>
                    <input data-legit="${false}" data-songNum="${num + 1}" onblur="checkMP3url(this);" class="songAddInputLeft" type="text"
                    placeholder="http:// .mp3" />
                    <label>Name:&nbsp;</label>
                    <input onblur="inputValLengthCheck(this);" class="songAddInput" type="text" />
                  </div>
                  <div class="form-control errMsg" id="${num + 1}songErr"></div> 
        `);
    if (edit) {
        $('.songAddInputLeft').last()[0].dataset.legit = true;
        $($('.songAddInputLeft').last()[0]).val(song.url);
        $($('.songAddInput').last()[0]).val(song.name);
    }
    ;
}
;

/// delete row(song) if regretted
function deleteSongAddRow(icon, editStart = false) {
    if (parseInt($('#addingSongsCounter').val()) > 1 || editStart === true) {
        //remove row
        $(icon.parentElement).next('.errMsg').remove();
        icon.parentElement.remove();
        //count and fix counters to be appropiate
        let songAddingRows = $('.songAddRow');
        songAddingRows.each((i, songRow) => {
            $(songRow).children('input[class="songAddInputLeft"]')[0].dataset.songnum = i + 1;
            $(songRow).next('.errMsg').attr("id", `${i + 1}songErr`);
        });
        $('#addingSongsCounter').val(songAddingRows.length);
    } else {
        errGenerator(`addPlaylistSongsMasterErr`, "1 Song is the minimum to continue.");
    }
    ;
}
;

// name validation - need to have a value
function inputValLengthCheck(input) {
    if ($(input).val().length > 0) {
        $(input).css("border", "1px solid lightgray");
    } else {
        $(input).css("border", "3px solid red");
    }
    ;
}
;

//// fiinally last check, runs in loop on every input and check if it's ok and if so, call function to save in Db
function savePlaylistAndSongs(edit = false) {
    let songAddingRows = $('.songAddRow');
    let formOk = true;
    let songsArray = [];
    songAddingRows.each((i, songRow) => {
        let masterURLCheck = $(songRow).children('input[class="songAddInputLeft"]')[0];
        let nameLengthCheck = $($(songRow).children('input[class="songAddInput"]')[0]);
        if (masterURLCheck.dataset.legit == "true" && nameLengthCheck.val().length > 0) {
            //ok
            nameLengthCheck.css("border", "1px solid lightgray");
            formOk = true;
            songsArray.push({
                name: nameLengthCheck.val(),
                url: $(masterURLCheck).val()
            });
        } else {
            if (!(nameLengthCheck.val().length > 0)) {
                nameLengthCheck.css("border", "3px solid red");
            }
            ;
            if (!($(masterURLCheck).val().length > 0)) {
                $(masterURLCheck).css("border", "3px solid red");
            }
            formOk = false;
        }
        ;
    });
    ///check master
    if (formOk) {
        //everything seems fine
        saveNewPlaylistSongs(songsArray, edit);
    } else {
        //bad
        errGenerator(`addPlaylistSongsMasterErr`, "Please Make Sure All The Fields Arn't Empty and in correct format");
    }
    ;
}
;


// saving new playlist songs in Db after validations
function saveNewPlaylistSongs(songsArray, edit = false) {
    let littleBird = $('#currentPlaylistData')[0];
    let playlistName = littleBird.dataset.playname.toUpperCase();
    let playlistImage = littleBird.dataset.playimg;
    let urlE = "";
    let dataCon = {};
    if (!edit) {
        //add
        urlE = `api/playlist.php?type=playlist`;
        dataCon = {
            name: playlistName,
            image: playlistImage,
            songs: songsArray
        };
    } else {
        //edit
        let playlistID = $('#loading').attr("data-id");
        urlE = `api/playlist.php?type=songs&id=${playlistID}`;
        dataCon = {songs: songsArray};
    }
    ;
    $('.addingSongsControlButtons .formBTNCont button').html(`<img src="images/loadingBTN.gif" style="position: absolute;top: 20%;left: 43.5%;height: 20px;"/>`);
    $('.addingSongsControlButtons .formBTNCont button').css({backgroundColor: "rgb(143, 54, 13)", minWidth: "139.52px", position: "relative"});
    ///
    $.ajax({
        url: urlE,
        type: "POST",
        data: dataCon,
        success: function (data) {
            if (!edit) {
                //returns id intiger of added playlist.
                getSpecificPlaylist(data.data.id, appendPlaylistToDOM);
            } else {
                getAllPlaylists();
                if ($($('.playerWrapper')[0]).css("display") == "block" && $('.playerCont').css("display") == "block" && $('.playerSideButtons .circle-for-fa-pen').attr("data-id") == $('#loading').attr("data-id")) {
                    closePlayer();
                    openPlayer($('#loading').attr("data-id"), songsArray);
                }
                ;
            }
            ;
            $('#localModal').modal('hide');
        }
    });
}
;

/// gets inputArray to reset - does it
function clearForm(formInputsArray) {
    setTimeout(() => {
        $(formInputsArray).each((i, input) => {
            input.wrap('<form>').closest('form').get(0).reset();
            input.unwrap();
        });
    }, 10);
};

/// err Generator, gets id and message, call it
function errGenerator(id, message) {
    $(`#${id} `).html(`${message} `);
    $(`#${id} `).show();
    setTimeout(() => {
        $(`#${id}`).hide();
    }, 2000);
};

//search Plugin - easyautoComplete power()
let options = {

    url: 'api/playlist.php?type=playlist',
    listLocation: "data",
    getValue: "name",
    template: {
        type: "custom",
        method: function (value, item) {
            return `${value}&nbsp;<i onclick="getPlaylistSongs(${item.id});" class="playFromSearch fas fa-play"></i>`;
        }
    },

    list: {
        maxNumberOfElements: 10,
        onSelectItemEvent: function () {
            searchValueEntered();
        }
    }
};
$('#searchPlaylistInput').siblings("i").on("click" , function () {
    $('#searchPlaylistInput').val("");
    searchValueEntered();
});
$("#searchPlaylistInput").easyAutocomplete(options);

//pre edit songs
function prepareSongsEditArray(it) {
    let infoArr = JSON.parse(it.dataset.string)[0];
    let playlistID = infoArr.id;
    let playlistName = infoArr.name;
    let playlistImageURL = infoArr.img;
    ///
    getPlaylistSongs(playlistID, edit = true, playlistName, playlistImageURL);
};