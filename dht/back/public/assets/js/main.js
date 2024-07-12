const API_URL =
  window.location.origin.indexOf("localhost") > -1
    ? "http://localhost:9000"
    : "https://core.deephousetehran.net";
var artistsTable;
var genreTable;
var podcastTable;
var usersTable;
var schedules = [];

function getPodcastDataModal(podcastId, genreId, artistId, coverId) {
  var genre = "";
  var PodFile = "";
  var coverFile = "";
  var artist = "";
  genre = "<option selected>Select Genre</option>";
  PodFile = "<option selected>Select Podcast File</option>";
  coverFile = "<option selected>Select Cover File</option>";
  artist = "<option selected>Select Artist</option>";

  $.ajax({
    url: API_URL + "/panel/media/podcastsList",
    type: "get",
    success: (result) => {
      result.map((val, i) => {
        PodFile += "<option  value='" + val + "'>" + val + "</option>";
        $(podcastId).html(PodFile);
      });
    },
  });

  $.ajax({
    url: API_URL + "/panel/media/coversList",
    type: "get",
    success: (result) => {
      result.map((val, i) => {
        coverFile += "<option  value='" + val + "'>" + val + "</option>";
        $(coverId).html(coverFile);
      });
    },
  });

  $.ajax({
    url: API_URL + "/categories",
    success: (result) => {
      result.map((val, i) => {
        genre +=
          "<option style='background: " +
          val.cover +
          "' value='" +
          val._id +
          "'>" +
          val.name +
          "</option>";
        $(genreId).html(genre);
      });
    },
  });

  $.get(API_URL + "/artists", function (data) {
    data.map((val, i) => {
      artist += "<option value='" + val._id + "'>" + val.name + "</option>";
      $(artistId).html(artist);
    });
  });
}

if ($("#usersTable").length) {
  usersTable = $("#usersTable").DataTable({
    ajax: {
      url: API_URL + "/auth/users",
      beforeSend: function (request) {
        request.setRequestHeader("token", localStorage.getItem("token"));
      },
      dataSrc: "",
      method: "GET",
      cache: false,
    },
    processing: true,
    columns: [
      { data: "username", bSortable: true },
      { data: "created_at", bSortable: true },
      {
        data: "_id",
        mRender: function (data, type, full) {
          return `<button class="deleteUserBtn btn btn-danger" data-id="${data}">Delete</button>`;
        },
      },
    ],
  });

  $(document).on("click", ".deleteUserBtn", (e) => {
    var userId = e.target.getAttribute("data-id");
    var tr = $(e.target).closest("tr");

    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel",
        catch: "Yes",
      },
    }).then((value) => {
      if (value) {
        $.ajax({
          url: API_URL + "/auth/user/delete/" + userId,
          type: "delete",
          success: (result) => {
            // console.log(result.deletedCount)
            if (result.deletedCount) {
              swal({
                title: "Success!",
                text: "This User Deleted successfully!!",
                icon: "success",
                button: "OK!",
              });
              usersTable.ajax.reload();
            } else {
              swal({
                title: "Request Error!",
                text: "try again!",
                icon: "danger",
                button: "Close!",
              });
            }
          },
          error: (err) => {
            console.log(err);
            swal({
              title: "Request Error!",
              text: "try again!",
              icon: "danger",
              button: "Close!",
            });
          },
        });
      }
    });
  });
}

if ($("#PODCASTS").length) {
  podcastTable = $("#Podcasts").DataTable({
    ajax: {
      url: API_URL + "/podcasts",
      beforeSend: function (request) {
        request.setRequestHeader("token", localStorage.getItem("token"));
      },
      dataSrc: "",
      method: "GET",
      cache: false,
    },
    processing: true,
    // serverSide: true,
    // pageLength: 20,
    pagingType: "full_numbers",
    deferRender: true,
    // function (d, cb) {
    //     $.get(API_URL + '/podcasts')
    //         .then(response => response.json())
    //         .then(data => cb(data));
    // },
    // "aaData": result,
    columns: [
      { data: "name", bSortable: true },
      { data: "description", bSortable: true },
      { data: "genre", bSortable: true,        mRender: function (data, type, row) {
        return (
         data?.map(genre=>genre.name).join(",")
        );
      },},
      { data: "artist.name", bSortable: true },
      { data: "created_at", bSortable: true },
      {
        data: "cover",
        mRender: function (data, type, row) {
          return (
            "<img class='podcasts-img' src='" +
            API_URL +
            "/images/covers/" +
            data +
            "'>"
          );
        },
        bSortable: true,
      },
      {
        data: "name",
        mRender: function (data, type, row) {
          return (
            "<button data-edit-podcast-name='" +
            data +
            "' data-edit-podcast-id='" +
            row._id +
            "' class='btn btn-warning editPodcast'>Edit</button>"
          );
        },
        bSortable: true,
      },
      {
        data: "_id",
        mRender: function (data, type, row) {
          return (
            "<button data-delete-podcast-name='" +
            data +
            "' class='btn btn-danger deletePodcast'>Delete</button>"
          );
        },
        bSortable: true,
      },
    ],
  });

  $(document).on("click", ".deletePodcast", (e) => {
    var PodcastId = e.target.getAttribute("data-delete-podcast-name");
    var tr = $(e.target).closest("tr");

    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel",
        catch: "Yes",
      },
    }).then((value) => {
      if (value) {
        $.ajax({
          url: API_URL + "/podcasts",
          type: "delete",
          data: { _id: PodcastId },
          success: (result) => {
            // console.log(result.deletedCount)
            if (result.deletedCount) {
              swal({
                title: "Success!",
                text: "This Podcast Deleted successfully!!",
                icon: "success",
                button: "OK!",
              });
              console.log(podcastTable.row(tr));
              podcastTable.ajax.reload();
            } else {
              swal({
                title: "Request Error!",
                text: "try again!",
                icon: "danger",
                button: "Close!",
              });
            }
          },
        });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  });

  var podcastName = "";
  var podcastId = "";
  var trForUpdatePodcasts = "";
  $(document).on("click", ".editPodcast", (e) => {
    getPodcastDataModal(
      "#edit-listPodcastFile",
      "#edit-genre",
      "#edit-artist",
      "#edit-coverFile"
    );
    $(".edit-podcast-modal").modal("show");
    podcastName = e.target.getAttribute("data-edit-podcast-name");
    podcastId = e.target.getAttribute("data-edit-podcast-id");
    // console.log(PodcastId)
    trForUpdatePodcasts = $(this).closest("tr");
    $.ajax({
      url: API_URL + "/podcasts/" + podcastName,
      type: "get",
      // data: { id: PodcastId },
      success: (podcast) => {
        jQuery(`#edit-name`).val(podcast.name);
        jQuery(`#edit-listPodcastFile`).val(podcast.podcastFile);
        jQuery(`#edit-genre`).val(podcast.genre?.map(genre=>genre._id));
        jQuery(`#edit-artist`).val(podcast.artist._id);
        jQuery(`#edit-coverFile`).val(podcast.cover);
        jQuery("#edit-description").val(podcast.description);
      },
      error: (err) => console.log(err),
    });
  });

  $(document).on("submit", "#edit-podcast", (e) => {
    e.preventDefault();
    var podcast = $("#edit-name").val();
    var artist = $("#edit-artist").val();
    var genre = $("#edit-genre").val();
    var description = $("#edit-description").val();
    var podcastFile = $("#edit-listPodcastFile").val();
    var cover = $("#edit-coverFile").val();

    if (podcast && artist && genre  && cover && podcastFile) {
      $.ajax({
        url: API_URL + "/podcasts/" + podcastId,
        cache: false,
        dataType: "JSON",
        method: "PUT",
        data: {
          name:podcast,
          artist,
          genre,
          description,
          podcastFile,
          cover,
        },
        success: (result) => {
          console.log(result);
          podcastTable.row(trForUpdatePodcasts).remove().draw();

          podcastTable.ajax.reload();
          $(".edit-podcast-modal").modal("toggle");
          // $('#configform')[0].reset();
          swal({
            title: "Success",
            text: "Podcast Added",
            icon: "success",
            button: "OK!",
          });
        },
        error: (err) => {
          console.log(err);
          swal({
            title: "Request Error!",
            text: "try again!",
            icon: "danger",
            button: "Close!",
          });
        },
      });
    } else {
      swal({
        title: "Podcast information not null",
        text: "Please select all the required fields!",
        icon: "danger",
        button: "OK!",
      });
    }
  });

  // ***add podcast***
  $("#add-podcast").on("click", () => {
    getPodcastDataModal(
      "#listPodcastFile",
      "#genre",
      "#artist",
      "#listCoverFile"
    );
  });

  $(document).on("submit", "#add-podcast-form", (e) => {
    e.preventDefault();
    var podName = $("#podcastName").val();
    var artName = $("#artist").val();
    var genreVal = $("#genre").val();
    var description = $("#description").val();
    var podcastFile = $("#listPodcastFile").val();
    var cover = $("#listCoverFile").val();

    var data = new FormData();
    data.append("name", podName);
    data.append("artist", artName);
    data.append("genre", genreVal);
    data.append("description", description);
    data.append("podcastFile", podcastFile);
    data.append("cover", cover);
    //
    // jQuery.each(jQuery('#cover')[0].files, function(i, file) {
    //     data.append('cover', file);
    // });

    if (podName && artName && genreVal && cover) {
      $.ajax({
        url: API_URL + "/podcasts",
        cache: false,
        contentType: false,
        processData: false,
        method: "POST",
        data: data,
        success: (result) => {
          console.log(result);
          podcastTable.ajax.reload();
          $(".addPodcastModal").modal("toggle");
          // $('#configform')[0].reset();
          swal({
            title: "Success",
            text: "Podcast Added Successfully.",
            icon: "success",
            button: "OK!",
          });
        },
      });
    } else {
      swal({
        title: "Error",
        text: "Please select all the required fields!",
        icon: "danger",
        button: "OK!",
      });
    }
  });
}

if ($("#GENRES").length) {
  //get
  $(".addGenreModal").on("click", () => {
    $("#genreName").val("");
    $("#hexColor").val("");
  });

  $.ajax({
    url: API_URL + "/categories",
    success: (result) => {
      // console.log(result)

      genreTable = $("#Genres").DataTable({
        aaData: result,
        columns: [
          { data: "name", bSortable: true },

          {
            data: "cover",
            mRender: function (data, type, full) {
              return (
                "<div class='genreCoverTable' style='background: " +
                data +
                "'></div>"
              );
            },
            bSortable: true,
          },
          {
            data: "_id",
            mRender: function (data, type, full) {
              return (
                "<button data-edit-genre-id='" +
                data +
                "' class='btn btn-warning editGenre'>Edit</button>"
              );
            },
            bSortable: true,
          },
          {
            data: "_id",
            mRender: function (data, type, full) {
              return (
                "<button data-delete-genre-id='" +
                data +
                "' class='btn btn-danger deleteGenre'>Delete</button>"
              );
            },
            bSortable: true,
          },
        ],
      });
    },
  });

  $("#saveGenre").on("click", () => {
    var name = $("#genreName").val();
    var color = $("#hexColor").val();
    // var elCover = "<span class='genreCoverTable' style='background:"+ color +";'></span>";
    // console.log(name + "  ==========  " + color);
    if (name == "" && color == "") {
      swal({
        title: "Genre name and color not null!",
        text: "please choose name and color",
        icon: "danger",
        button: "Close!",
      });
      return;
    } else {
      let data = new FormData();
      data.append("name", name);
      data.append("cover", $("#coverImg")[0].files[0]);

      $.ajax({
        url: API_URL + "/categories",
        type: "POST",
        enctype: 'multipart/form-data',
        data: data,
        contentType: false,
        cache: false,
        processData: false,
        success: (result) => {
          // console.log(result)
          // genreTable.row.add([]).draw();
          genreTable.row
            .add({
              name: name,
              cover: color,
              edit:
                "<button data-edit-genre-id='" +
                name +
                "' class='btn btn-warning editGenre'>Edit</button>",
              delete:
                "<button data-edit-genre-id='" +
                name +
                "' class='btn btn-warning editGenre'>Edit</button>",
            })
            .draw();

          // $(".genreCoverTable").css('background', color);

          // var $tr = $('<tr>').append(
          //     $('<td>').html(name),
          //     $('<td>').html("<div class='genreCoverTable' style='background: " + color + "'></div>"),
          //     $('<td>').html("<button data-edit-genre-id='" + name + "' className='btn btn-warning editGenre'>Edit</button>"),
          //     $('<td>').html("<button data-delete-genre-id='" + name + "' class='btn btn-danger deleteGenre'>Delete</button>"),
          // ).appendTo('#Genres tbody');
          swal({
            title: "add Success!",
            text: "Added successfully!",
            icon: "success",
            button: "OK!",
          });
          $("#genreName").val("");
          $("#hexColor").val("");
          $(".addGenresModal").modal("hide");
        },
      });
    }
  });

  //delete
  $(document).on("click", ".deleteGenre", function () {
    // console.log(this.id);
    //<button data-artist-id="asdasd"
    var genreID = $(this).attr("data-delete-genre-id");
    var tr = $(this).closest("tr");
    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel!",
        catch: "Yes",
      },
    }).then((value) => {
      if (value) {
        $.ajax({
          url: API_URL + "/categories",
          type: "DELETE",
          data: { _id: genreID },
          success: (result) => {
            // console.log(result)
            if (!result.deletedCount) {
              swal({
                title: "Request Error!",
                text: "try again!",
                icon: "danger",
                button: "Close!",
              });
            } else {
              swal({
                title: "Success!",
                text: "This Genre Deleted successfully!!",
                icon: "success",
                button: "OK!",
              });

              genreTable.row(tr).remove().draw();
            }
          },
        });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  });

  //************************edit********************
  $(document).on("click", ".editGenre", function (e) {
    $(".edit-genre-modal").modal("show");
    var genreID = e.target.getAttribute("data-edit-genre-id");
    var tr = $(e.target).closest("tr");

    $("#save-genre-edit").on("click", () => {
      var name = $("#genre-name-edit").val();
      var color = $("#color-edit").val();
      // console.log(genreID, name, color)
      let data = new FormData();
      data.append("_id", genreID);
      data.append("name", name);
      data.append("cover", $("#updateCoverImg")[0].files[0]);
      $.ajax({
        url: API_URL + "/categories",
        type: "PUT",
        enctype: 'multipart/form-data',
        data: data,
        contentType: false,
        cache: false,
        processData: false,
        success: (result) => {
          console.log(result);
          // genreTable.dataTable.Api('#Genres');
          if (!result.deletedCount) {
            swal({
              title: "Request Error!",
              text: "try again!",
              icon: "danger",
              button: "Close!",
            });
          }
          swal({
            title: "Good job!",
            text: "This Genre Edit successfully!",
            icon: "success",
            button: "OK",
          });

          genreTable.row(tr).remove().draw();
          genreTable.row
            .add({
              name: name,
              cover: color,
              edit:
                "<button data-edit-genre-id='" +
                name +
                "' class='btn btn-warning editGenre'>Edit</button>",
              delete:
                "<button data-edit-genre-id='" +
                name +
                "' class='btn btn-warning editGenre'>Edit</button>",
            })
            .draw();
          $(".edit-genre-modal").modal("hide");

          // $.ajax({
          //     url: API_URL + '/categories',
          //     success: result => {
          //         // console.log(result)

          // genreTable = $('#Genres').DataTable({
          //     "aaData": API_URL + '/categories',
          // });
          // }
          // });
        },
      });
    });
  });

  //******COLOR PICKER******
  // Inputs
  function colorPicker(input1, input2) {
    const valueInput = document.querySelector('input[id="' + input1 + '"]');
    const colorInput = document.querySelector('input[id="' + input2 + '"]');

    // Sync the color from the picker
    const syncColorFromPicker = () => {
      valueInput.value = colorInput.value;
    };

    // Sync the color from the field
    const syncColorFromText = () => {
      colorInput.value = valueInput.value;
    };

    // Bind events to callbacks
    colorInput.addEventListener("input", syncColorFromPicker, false);
    valueInput.addEventListener("input", syncColorFromText, false);

    // Optional: Trigger the picker when the text field is focused
    valueInput.addEventListener("focus", () => colorInput.click(), false);

    // Refresh the text field
    syncColorFromPicker();
  }

  colorPicker("hexColor", "COLOR");
  colorPicker("hex-color-edit", "color-edit");
}

if ($("#ARTISTS").length) {
  $.ajax({
    url: API_URL + "/artists",
    success: (result) => {
      artistsTable = $("#Artists").DataTable({
        aaData: result,
        columns: [
          { data: "name", bSortable: true },
          { data: "created_at", bSortable: true },
          {
            data: "_id",
            mRender: function (data, type, full) {
              return (
                "<button data-artist-id='" +
                data +
                "' class='btn btn-danger deleteARTIST'>Delete</button>"
              );
            },
            bSortable: true,
          },
        ],
      });
    },
  });

  $(document).on("click", ".deleteARTIST", function () {
    // console.log(this.id);
    //<button data-artist-id="asdasd"
    var ArtistId = $(this).attr("data-artist-id");
    var tr = $(this).closest("tr");

    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel!",
        catch: "Yes",
      },
    }).then((value) => {
      switch (value) {
        case "catch":
          $.ajax({
            url: API_URL + "/artists",
            type: "DELETE",
            data: { _id: ArtistId },
            success: (result) => {
              // console.log(result)
              if (!result.deletedCount) {
                swal({
                  title: "Request Error!",
                  text: "try again!",
                  icon: "danger",
                  button: "Close!",
                });
              } else {
                swal({
                  title: "Success!",
                  text: "This artist Deleted successfully!!",
                  icon: "success",
                  button: "OK!",
                });
                artistsTable.row(tr).remove().draw();
              }
            },
          });
          break;

        default:
      }
    });
  });

  $("#saveArtist").on("click", () => {
    let name = $("#artistName").val();
    if (name == "") {
      swal({
        title: "Artist name not null!",
        text: "try again!",
        icon: "danger",
        button: "Close!",
      });
      return;
    } else {
      $.ajax({
        url: API_URL + "/artists",
        type: "POST",
        data: { name: name },
        success: (result) => {
          console.log(result.created_at);
          artistsTable.row
            .add({
              name: name,
              created_at: result.created_at,
              Delete:
                "<button data-artist-id='" +
                result._id +
                "' class='btn btn-danger deleteARTIST'>Delete</button>",
            })
            .draw();
          swal({
            title: "Good job!",
            text: "Artist Added successfully!",
            icon: "success",
            button: "OK",
          });
          $("#artistName").val("");
          $("#addArtistModal").modal("hide");
        },
      });
    }
  });
}

//*************** FILES ****************

if ($("#PODCASTSFILES").length) {
  function GetPodcastFile() {
    var EL = "";
    $.ajax({
      url: API_URL + "/panel/media/podcastsList",
      success: (result) => {
        result.map((val, i) => {
          EL +=
            "<div class='col-lg-3 p-1'>" +
            "<div class='border MusicIconDelete bg-white rounded p-3'>" +
            `<button data-podcast='" + val + "' class='btn btn-danger podcastItemDelete' aria-hidden='true'>
                              <i class='fa fa-trash text-white' aria-hidden='true'></i>
                        </button>` +
            " <i class='fa text-muted py-5 musicIcon fa-music d-block' aria-hidden='true'></i>" +
            val +
            "</div>" +
            "</div>";

          $(".dataPODCASTLIST").html(EL);
        });
        // console.log(result)
      },
    });
  }

  GetPodcastFile();

  $("#uploadForm").on("submit", function (e) {
    e.preventDefault();
    $(".progress-bar").width("0%");
    var podcastFile;
    var data = new FormData();
    jQuery.each(jQuery("#fileInput")[0].files, function (i, file) {
      data.append("mediaFile", file);
      podcastFile = file;
    });
    // console.log(podcastFile)
    e.preventDefault();
    if (podcastFile) {
      $.ajax({
        xhr: function () {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener(
            "progress",
            function (evt) {
              if (evt.lengthComputable) {
                var percentComplete = parseInt((evt.loaded / evt.total) * 100);
                $(".progress-bar").width(percentComplete + "%");
                $(".progress-bar").html(percentComplete + "%");
              }
            },
            false
          );
          return xhr;
        },
        type: "POST",
        url: API_URL + "/panel/media/podcast/add",
        data: data,
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function () {
          $(".progress-bar").width("0%");
          $("#uploadStatus").html(
            '<div class="spinner-border text-primary" role="status">\n' +
              '  <span class="sr-only">Loading...</span>\n' +
              "</div>"
          );
        },
        error: function (err) {
          console.log(err);
          $("#uploadStatus").html(
            '<p style="color:#EA4335;">File upload failed, please try again.</p>'
          );
        },
        success: function (resp) {
          if (resp.result == true) {
            // $('#uploadForm')[0].reset();
            // $('#uploadStatus').html('<p style="color:#28A74B;">File has uploaded successfully!</p>');

            $(".dataPODCASTLIST").append(
              "<div class='col-lg-3 p-1'>" +
                "<div class='border MusicIconDelete bg-white rounded p-3'>" +
                "<i data-podcast='" +
                podcastFile.name +
                "' class='fa fa-trash btn podcastItemDelete' aria-hidden='true'></i>" +
                " <i class='fa text-muted py-5 musicIcon fa-music d-block' aria-hidden='true'></i>" +
                podcastFile.name +
                "</div>" +
                "</div>"
            );

            $(".addPodcastFileModal").modal("toggle");
            swal({
              title: "Success",
              text: "Podcast has uploaded successfully!",
              icon: "success",
              button: "OK!",
            });
            $(".progress-bar").width("0%");
            $(".progress-bar").html("0%");
          } else {
            // $('#uploadStatus').html('<p style="color:#EA4335;">Please select a valid file to upload.</p>');
            swal({
              title: "Oops",
              text: "Please select a valid file to upload.",
              icon: "danger",
              button: "OK!",
            });
          }
        },
      });
    } else {
      swal({
        title: "Podcast file not null!",
        text: "please choose file!",
        icon: "danger",
        button: "Close!",
      });
      return;
    }
  });

  //Delete Podcast File

  $(document).on("click", ".podcastItemDelete", (event) => {
    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel!",
        catch: "Yes",
      },
    }).then((value) => {
      if (value) {
        let podName = event.target.getAttribute("data-podcast");
        $.ajax({
          url: API_URL + "/panel/media/podcast/remove",
          method: "delete",
          data: {
            name: podName,
          },
          success: (data) => {
            // console.log(data);
            if (data.result == true) {
              swal({
                title: "Success",
                text: "Podcast file deleted",
                icon: "success",
                button: "OK!",
              });
              GetPodcastFile();
            }
          },
        });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  });
}

if ($("#COVERS").length) {
  function GetCovers() {
    let EL = "";
    $.ajax({
      url: API_URL + "/panel/media/coversList",
      cache: false,
      success: (result) => {
        result.map((val, i) => {
          // console.log(val)
          EL +=
            "<div class='col-lg-3 p-1'>" +
            // `<div class='coverItem' style='background: url("${API_URL}/images/covers/${val}")'>` +
            "<img class='coverItem' src='/images/covers/" +
            val +
            "'>" +
            "<i data-cover='" +
            val +
            "' class='fa fa-trash btn coverItemDelete' aria-hidden='true'></i>" +
            "</div>";

          $(".COVERList").html(EL);
        });
        // console.log(result)
      },
    });
  }

  GetCovers();

  $("#CoverFileName").on("submit", function (e) {
    e.preventDefault();
    var coverFile;
    $(".progress-bar").width("0%");
    var data = new FormData();
    jQuery.each(jQuery("#CoverFile")[0].files, function (i, file) {
      data.append("mediaFile", file);
      coverFile = file;
    });

    if (coverFile) {
      $.ajax({
        xhr: function () {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener(
            "progress",
            function (evt) {
              if (evt.lengthComputable) {
                var percentComplete = parseInt((evt.loaded / evt.total) * 100);
                $(".progress-bar").width(percentComplete + "%");
                $(".progress-bar").html(percentComplete + "%");
              }
            },
            false
          );
          return xhr;
        },
        type: "POST",
        url: API_URL + "/panel/media/cover/add",
        data: data,
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function () {
          $(".progress-bar").width("0%");
          $("#uploadStatus").html(
            '<div class="spinner-border text-primary" role="status">\n' +
              '  <span class="sr-only">Loading...</span>\n' +
              "</div>"
          );
        },
        error: function (err) {
          console.log(err);
          $("#uploadStatus").html(
            '<p style="color:#EA4335;">File upload failed, please try again.</p>'
          );
        },
        success: function (resp) {
          if (resp.result == true) {
            coverFile.arrayBuffer().then((arrayBuffer) => {
              let blob = new Blob([new Uint8Array(arrayBuffer)], {
                type: coverFile.type,
              });
              // console.log(blob);
              $(".COVERSLIST").append(`<div class="col-lg-3 p-1">
                        <img class="coverItem" src="data:${
                          coverFile.type
                        };base64,${atob(blob)}"/>
                        <i data-cover="data:${coverFile.type};base64,${atob(
                blob
              )}" class="fa fa-trash btn coverItemDelete" aria-hidden="true"></i>
                        </div>`);
            });

            $(".addCoverFileModal").modal("toggle");
            // $('#CoverFileName')[0].reset();

            swal({
              title: "Success",
              text: "Cover has uploaded successfully!",
              icon: "success",
              button: "OK!",
            });
            $(".progress-bar").width("0%");
            $(".progress-bar").html("0%");
            GetCovers();
          } else {
            swal({
              title: "Oops",
              text: "Please select a valid file to upload.",
              icon: "danger",
              button: "OK!",
            });
          }
        },
      });
    } else {
      swal({
        title: "Cover file not null!",
        text: "please choose file!",
        icon: "danger",
        button: "Close!",
      });
      return;
    }
  });

  //Delete Cover
  $(document).on("click", ".coverItemDelete", (e) => {
    // let Cover = $('.coverItemDelete').attr('data-cover');

    swal("Are you sure?", {
      buttons: {
        cancel: "Cancel!",
        catch: "Yes",
      },
    }).then((value) => {
      if (value) {
        let Cover = e.target.getAttribute("data-cover");
        // console.log(Cover);
        $.ajax({
          url: API_URL + "/panel/media/cover/remove",
          method: "delete",
          data: {
            name: Cover,
          },
          success: (data) => {
            // console.log(data);
            if (data.result == true) {
              swal({
                title: "Success",
                text: "Cover file deleted",
                icon: "success",
                button: "OK!",
              });
              GetCovers();
            }
          },
        });
      } else {
        swal("Your imaginary file is safe!");
      }
    });
  });
}
var calendar;

function getPodcasts(callback) {
  $.ajax({
    url: API_URL + "/podcasts",
    type: "GET",
    success: callback,
    error: (err) => {
      console.log(err);
    },
  });
}

function checkTimespansConflict(
  start_datetime1,
  end_datetime1,
  start_datetime2,
  end_datetime2
) {
  var date1 = [moment.utc(start_datetime1), moment.utc(end_datetime1)];
  var date2 = [moment.utc(start_datetime2), moment.utc(end_datetime2)];

  console.log("date1, date2", date1, date2);

  var range = moment.range(date1);
  var range2 = moment.range(date2);

  // has overlapping
  return range.overlaps(range2);
}

function hasConflictWithOtherSchedules(
  start_datetime,
  end_datetime,
  channelNumber
) {
  let datesOfNewSchedule =
    moment(start_datetime).format("YYYY-MM-DD") ==
    moment(end_datetime).format("YYYY-MM-DD")
      ? [moment(start_datetime).format("YYYY-MM-DD")]
      : [
          moment(start_datetime).format("YYYY-MM-DD"),
          moment(end_datetime).format("YYYY-MM-DD"),
        ];

  let conflictFlag = false;

  datesOfNewSchedule.forEach((date) => {
    schedules.forEach((schedule) => {
      if (schedule.channel == channelNumber) {
        if (
          moment(start_datetime) > moment(date) ||
          moment(end_datetime) > moment(date) ||
          moment(end_datetime) < moment(date + " 23:59:59") ||
          moment(start_datetime) > moment(date + " 23:59:59")
        ) {
          if (
            checkTimespansConflict(
              start_datetime,
              end_datetime,
              schedule.start_datetime,
              schedule.end_datetime
            )
          ) {
            conflictFlag = true;
          }
        }
      }
    });
  });
  return conflictFlag;
}

document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: "Asia/Tehran",
    initialView: "resourceTimelineDay",
    aspectRatio: 1.5,
    displayEventTime: true,
    displayEventEnd: true,
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      // omitZeroMinute: true,
      meridiem: "short",
    },
    headerToolbar: {
      left: "promptResource today",
      center: "title",
      right: "prev,next", // 'resourceTimelineDay,resourceTimelineWeek'
    },
    editable: true,
    droppable: true,
    slotDuration: "00:02:00",
    slotLabelInterval: 1,
    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
      // second: '2-digit',
      hour12: false,
      // omitZeroMinute: true,
      meridiem: "short",
    },
    resourceAreaHeaderContent: "Channels",
    resourceAreaWidth: 100,
    resources: [
      {
        id: "c1",
        title: "Channel 1",
        eventOverlap: false,
      },
      {
        id: "c2",
        title: "Channel 2",
        eventOverlap: false,
      },
    ],
    customButtons: {
      promptResource: {
        text: "+ Add Podcast",
        click: function () {
          $("#addPodcastToScheduleModal").modal("show");
        },
      },
    },
    events: [],
    eventChange: (e) => {
      let scheduleId = e.oldEvent.id;
      let channel = e.event._def.resourceIds[0].substring(1);
      let start_datetime = moment
        .utc(e.event.start)
        .format("YYYY-MM-DD HH:mm:ss");
      let end_datetime = moment.utc(e.event.end).format("YYYY-MM-DD HH:mm:ss");

      updateLiveSchedule({ scheduleId, channel, start_datetime, end_datetime });
    },
    eventDidMount: ({ event, el }) => {
      $(el).append("<span class='deleteSchedule bg-danger px-2'>X</span>");
      $(el)
        .find(".deleteSchedule")
        .click(function () {
          swal("Are you sure?", {
            buttons: {
              cancel: "Cancel!",
              catch: "Yes",
            },
          }).then((value) => {
            if (value) {
              deleteSchedule(event.id, (result) => {
                if (result.deletedCount) {
                  event.remove();
                  swal({
                    title: "Alert",
                    text: "The live removed successfully!",
                    icon: "success",
                    button: "OK",
                  });
                } else {
                  swal({
                    title: "Alert",
                    text: "An error happend!",
                    icon: "danger",
                    button: "OK",
                  });
                }
              });
            }
          });
        });
    },
  });

  calendar.render();
});

const deleteSchedule = (live_id, callback) => {
  $.ajax({
    url: API_URL + "/schedules/delete/" + live_id,
    cache: false,
    dataType: "JSON",
    method: "DELETE",
    success: callback,
    error: callback,
  });
};

const updateLiveSchedule = (liveScheduleData) => {
  $.ajax({
    url: API_URL + "/schedules/" + liveScheduleData.scheduleId,
    cache: false,
    dataType: "JSON",
    method: "PUT",
    data: liveScheduleData,
    success: (result) => {
      console.log(result);
    },
    error: (error) => {
      console.log(error);
    },
  });
};

var podcasts;
$(document).ready(function () {
  if ($("#calendar").length) {
    getPodcasts((podcastsList) => {
      podcasts = podcastsList;
      podcasts.forEach((podcast) => {
        $("#podcastName").append(
          `<option value="${podcast._id}" data-duration="${podcast.duration}">${podcast.name}</option>`
        );
      });
    });

    $.ajax({
      url: API_URL + "/schedules",
      cache: false,
      dataType: "json",
      type: "GET",
      success: (data) => {
        schedules = data;
        schedules.forEach((schedule) => {
          // $('#calendar').fullCalendar("renderEvent", {
          //     id:schedule._id,
          //     title: schedule.podcast.name,
          //     start: new Date(moment.utc(schedule.start_datetime).format("YYYY-MM-DD HH:mm:ss")),
          //     end: new Date(moment.utc(schedule.end_datetime).format("YYYY-MM-DD HH:mm:ss")),
          //     backgroundColor: schedule.podcast.genre.cover,
          //     editable: true,
          //     startEditable: true,
          //     durationEditable: true,
          //     draggable: true,
          //     className:"scheduleItem"
          // })
          console.log(
            new Date(
              moment
                .utc(schedule.start_datetime)
                .add(4.5, "hours")
                .format("YYYY-MM-DD HH:mm:ss")
            ),
            new Date(
              moment.utc(schedule.end_datetime).format("YYYY-MM-DD HH:mm:ss")
            )
          );

          calendar.addEvent({
            id: schedule._id,
            resourceId: "c" + schedule.channel,
            title: schedule?.podcast?.name,
            start: new Date(
              moment
                .utc(schedule.start_datetime)
                .add(3.5, "hours")
                .format("YYYY-MM-DD HH:mm:ss")
            ),
            end: new Date(
              moment
                .utc(schedule.end_datetime)
                .add(3.5, "hours")
                .format("YYYY-MM-DD HH:mm:ss")
            ),
            backgroundColor: schedule?.podcast?.genre?.cover,
            editable: true,
            startEditable: true,
            durationEditable: false,
            draggable: true,
            className: "scheduleItem",
          });
        });
      },
      error: function (err) {
        console.log(err);
      },
    });
  }

  $(document).on("click", "#addPodcastSchedule", function () {
    let podcastId = $("#podcastName").val();
    let channelNumber = $("#channelNumber").val();
    let podcastDuration = moment.utc(parseInt($("#podcastName option:selected").attr(
      "data-duration"
    ))).format("HH:mm:ss");

    let startDate = $("#scheduleDate").val();
    let startTime = $("#scheduleStartTime").val();
    let start_datetime = startDate + " " + startTime;
    let podcastDurationInSeconds = moment(podcastDuration, "HH:mm:ss").diff(
      moment().startOf("day"),
      "seconds"
    );

    let end_datetime = moment(start_datetime)
      .add(podcastDurationInSeconds, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
      
    let hasConflict = hasConflictWithOtherSchedules(
      start_datetime,
      end_datetime,
      channelNumber
    );

    if (hasConflict) {
      swal({
        title: "Conflict",
        text: "Your selected datetime has conflict with others!",
        icon: "danger",
        button: "OK!",
      });
    } else {
      $.ajax({
        url: API_URL + "/schedules",
        data: {
          podcast: podcastId,
          channel: channelNumber,
          start_datetime: start_datetime,
          end_datetime: end_datetime,
        },
        cache: false,
        dataType: "json",
        type: "POST",
        success: (res) => {
          if (res.result) {
            swal({
              title: "Alert",
              text: "The Schedule was added successfully!",
              icon: "success",
              button: "OK",
            });

            calendar.addEvent({
              id: res.schedule._id,
              resourceId: "c" + res.schedule.channel,
              title: $("#podcastName option:selected").text(),
              start: new Date(
                moment
                  .utc(start_datetime)
                  .add(3.5, "hours")
                  .format("YYYY-MM-DD HH:mm:ss")
              ),
              end: new Date(
                moment
                  .utc(end_datetime)
                  .add(3.5, "hours")
                  .format("YYYY-MM-DD HH:mm:ss")
              ),
              backgroundColor: "green",
              editable: true,
              startEditable: true,
              durationEditable: false,
              draggable: true,
              className: "scheduleItem",
            });

            $("#addPodcastToScheduleModal").modal("hide");
          } else {
            swal({
              title: "Alert",
              text: "An error happend!",
              icon: "danger",
              button: "OK",
            });
          }
        },
        error: function (err) {
          console.log(err);
        },
      });
    }
  });

  $(document).on("click", "#saveUser", function () {
    $.ajax({
      url: API_URL + "/auth/add",
      data: {
        first_name: $("#first_name").val(),
        last_name: $("#last_name").val(),
        username: $("#username").val(),
        password: $("#password").val(),
        email: $("#email").val(),
      },
      cache: false,
      dataType: "json",
      type: "POST",
      success: (res) => {
        if (res.result) {
          swal({
            title: "Alert",
            text: "The user added successfully!",
            icon: "success",
            button: "OK",
          });
          let { username, created_at, _id } = res.user;
          usersTable.row.add({ username, created_at, _id }).draw();
        } else {
          swal({
            title: "Alert",
            text: "An error happend!",
            icon: "danger",
            button: "OK",
          });
        }
      },
      error: function (err) {
        console.log(err);
      },
    });
  });
});
