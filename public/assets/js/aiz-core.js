//custom jquery method for toggle attr
$.fn.toggleAttr = function(attr, attr1, attr2) {
    return this.each(function() {
        var self = $(this);
        if (self.attr(attr) == attr1) self.attr(attr, attr2);
        else self.attr(attr, attr1);
    });
};
(function($) {

    // USE STRICT
    "use strict";

    AIZ.data = {
    	csrf:$('meta[name="csrf-token"]').attr("content"),
    	appUrl:$('meta[name="app-url"]').attr("content")
    };
    AIZ.uploader = {
        data: {
            selectedFiles: [],
            selectedFilesObject: [],
            clickedForDelete: null,
            allFiles: [],
            multiple: false,
            type: "all",
            next_page_url: null,
            prev_page_url: null
        },
        removeInputValue: function(id, array, elem) {
            var selected = array.filter(function(item) {
                return item !== id;
            });
            if (selected.length > 0) {
                $(elem)
                    .find(".file-amount")
                    .html(AIZ.uploader.updateFileHtml(selected));
            } else {
                elem.find(".file-amount").html("Choose File");
            }
            $(elem)
                .find(".selected-files")
                .val(selected);
        },
        removeAttachment: function() {
            $(".remove-attachment").each(function() {
                $(this).on("click", function() {
                    var value = $(this)
                        .closest(".file-preview-item")
                        .data("id");
                    var selected = $(this)
                        .closest(".file-preview")
                        .prev('[data-toggle="aizuploader"]')
                        .find(".selected-files")
                        .val()
                        .split(",")
                        .map(Number);

                    AIZ.uploader.removeInputValue(
                        value,
                        selected,
                        $(this)
                            .closest(".file-preview")
                            .prev('[data-toggle="aizuploader"]')
                    );
                    $(this)
                        .closest(".file-preview-item")
                        .remove();
                });
            });
        },
        deleteUploaderFile: function() {
            $(".aiz-uploader-delete").each(function() {
                $(this).on("click", function(e) {
                    e.preventDefault();
                    var id = $(this).data("id");
                    AIZ.uploader.data.clickedForDelete = id;
                    $("#aizUploaderDelete").modal("show");

                    $(".aiz-uploader-confirmed-delete").on("click", function(
                        e
                    ) {
                        e.preventDefault();
                        if (e.detail === 1) {
                            var clickedForDeleteObject =
                                AIZ.uploader.data.allFiles[
                                    AIZ.uploader.data.allFiles.findIndex(
                                        x =>
                                            x.id ===
                                            AIZ.uploader.data.clickedForDelete
                                    )
                                ];
                            $.ajax({
                                url:
                                    AIZ.data.appUrl +
                                    "/aiz-uploader/destroy/" +
                                    AIZ.uploader.data.clickedForDelete,
                                type: "DELETE",
                                dataType: "JSON",
                                data: {
                                    id: AIZ.uploader.data.clickedForDelete,
                                    _method: "DELETE",
                                    _token: AIZ.data.csrf
                                },
                                success: function() {
                                    AIZ.uploader.data.selectedFiles = AIZ.uploader.data.selectedFiles.filter(
                                        function(item) {
                                            return (
                                                item !==
                                                AIZ.uploader.data
                                                    .clickedForDelete
                                            );
                                        }
                                    );
                                    AIZ.uploader.data.selectedFilesObject = AIZ.uploader.data.selectedFilesObject.filter(
                                        function(item) {
                                            return (
                                                item !== clickedForDeleteObject
                                            );
                                        }
                                    );
                                    AIZ.uploader.updateUploaderSelected();
                                    AIZ.uploader.getAllUploads(
                                        AIZ.data.appUrl +
                                            "/aiz-uploader/get_uploaded_files"
                                    );
                                    AIZ.uploader.data.clickedForDelete = null;
                                    $("#aizUploaderDelete").modal("hide");
                                }
                            });
                        }
                    });
                });
            });
        },
        uploadSelect: function() {
            $(".aiz-uploader-select").each(function() {
                var elem = $(this);
                elem.on("click", function(e) {
                    var value = $(this).data("value");
                    var valueObject =
                        AIZ.uploader.data.allFiles[
                            AIZ.uploader.data.allFiles.findIndex(
                                x => x.id === value
                            )
                        ];
                    // console.log(valueObject);

                    elem.closest(".aiz-file-box-wrap").toggleAttr(
                        "data-selected",
                        "true",
                        "false"
                    );
                    if (!AIZ.uploader.data.multiple) {
                        elem.closest(".aiz-file-box-wrap")
                            .siblings()
                            .attr("data-selected", "false");
                    }
                    if (!AIZ.uploader.data.selectedFiles.includes(value)) {
                        if (!AIZ.uploader.data.multiple) {
                            AIZ.uploader.data.selectedFiles = [];
                            AIZ.uploader.data.selectedFilesObject = [];
                        }
                        AIZ.uploader.data.selectedFiles.push(value);
                        AIZ.uploader.data.selectedFilesObject.push(valueObject);
                    } else {
                        AIZ.uploader.data.selectedFiles = AIZ.uploader.data.selectedFiles.filter(
                            function(item) {
                                return item !== value;
                            }
                        );
                        AIZ.uploader.data.selectedFilesObject = AIZ.uploader.data.selectedFilesObject.filter(
                            function(item) {
                                return item !== valueObject;
                            }
                        );
                    }
                    AIZ.uploader.addSelectedValue();
                    AIZ.uploader.updateUploaderSelected();
                });
            });
        },
        updateFileHtml: function(array) {
            var fileText = "";
            if (array.length > 1) {
                var fileText = "Files";
            } else {
                var fileText = "File";
            }
            return array.length + " " + fileText + " " + "selected";
        },
        updateUploaderSelected: function() {
            $(".aiz-uploader-selected").html(
                AIZ.uploader.updateFileHtml(AIZ.uploader.data.selectedFiles)
            );
        },
        clearUploaderSelected: function() {
            $(".aiz-uploader-selected-clear").on("click", function() {
                AIZ.uploader.data.selectedFiles = [];
                AIZ.uploader.addSelectedValue();
                AIZ.uploader.addHiddenValue();
                AIZ.uploader.resetFilter();
                AIZ.uploader.updateUploaderSelected();
                AIZ.uploader.updateUploaderFiles();
            });
        },
        resetFilter: function() {
            $('[name="aiz-uploader-search"]').val("");
            $('[name="aiz-show-selected"]').prop("checked", false);
            $('[name="aiz-uploader-sort"] option[value=newest]').prop(
                "selected",
                true
            );
        },
        getAllUploads: function(url, search_key = null, sort_key = null) {
            $(".aiz-uploader-all").html(
                '<div class="align-items-center d-flex h-100 justify-content-center w-100"><div class="spinner-border" role="status"></div></div>'
            );
            var params = {};
            if (search_key != null && search_key.length > 0) {
                params["search"] = search_key;
            }
            if (sort_key != null && sort_key.length > 0) {
                params["sort"] = sort_key;
            }
            $.get(url, params, function(data, status) {
                //console.log(data);
                AIZ.uploader.data.allFiles = data.data;
                AIZ.uploader.allowedFileType();
                AIZ.uploader.addSelectedValue();
                AIZ.uploader.addHiddenValue();
                //AIZ.uploader.resetFilter();
                AIZ.uploader.updateUploaderFiles();
                if (data.next_page_url != null) {
                    AIZ.uploader.data.next_page_url = data.next_page_url;
                    $("#uploader_next_btn").removeAttr("disabled");
                } else {
                    $("#uploader_next_btn").attr("disabled", true);
                }
                if (data.prev_page_url != null) {
                    AIZ.uploader.data.prev_page_url = data.prev_page_url;
                    $("#uploader_prev_btn").removeAttr("disabled");
                } else {
                    $("#uploader_prev_btn").attr("disabled", true);
                }
            });
        },
        showSelectedFiles: function() {
            $('[name="aiz-show-selected"]').on("change", function() {
                if ($(this).is(":checked")) {
                    // for (
                    //     var i = 0;
                    //     i < AIZ.uploader.data.allFiles.length;
                    //     i++
                    // ) {
                    //     if (AIZ.uploader.data.allFiles[i].selected) {
                    //         AIZ.uploader.data.allFiles[
                    //             i
                    //         ].aria_hidden = false;
                    //     } else {
                    //         AIZ.uploader.data.allFiles[
                    //             i
                    //         ].aria_hidden = true;
                    //     }
                    // }
                    AIZ.uploader.data.allFiles =
                        AIZ.uploader.data.selectedFilesObject;
                } else {
                    // for (
                    //     var i = 0;
                    //     i < AIZ.uploader.data.allFiles.length;
                    //     i++
                    // ) {
                    //     AIZ.uploader.data.allFiles[
                    //         i
                    //     ].aria_hidden = false;
                    // }
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files"
                    );
                }
                AIZ.uploader.updateUploaderFiles();
            });
        },
        searchUploaderFiles: function() {
            $('[name="aiz-uploader-search"]').on("keyup", function() {
                var value = $(this).val();
                AIZ.uploader.getAllUploads(
                    AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files",
                    value,
                    $('[name="aiz-uploader-sort"]').val()
                );
                // if (AIZ.uploader.data.allFiles.length > 0) {
                //     for (
                //         var i = 0;
                //         i < AIZ.uploader.data.allFiles.length;
                //         i++
                //     ) {
                //         if (
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].file_original_name
                //                 .toUpperCase()
                //                 .indexOf(value) > -1
                //         ) {
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].aria_hidden = false;
                //         } else {
                //             AIZ.uploader.data.allFiles[
                //                 i
                //             ].aria_hidden = true;
                //         }
                //     }
                // }
                //AIZ.uploader.updateUploaderFiles();
            });
        },
        sortUploaderFiles: function() {
            $('[name="aiz-uploader-sort"]').on("change", function() {
                var value = $(this).val();
                AIZ.uploader.getAllUploads(
                    AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files",
                    $('[name="aiz-uploader-search"]').val(),
                    value
                );

                // if (value === "oldest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return (
                //                 new Date(a.created_at) - new Date(b.created_at)
                //             );
                //         }
                //     );
                // } else if (value === "smallest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return a.file_size - b.file_size;
                //         }
                //     );
                // } else if (value === "largest") {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             return b.file_size - a.file_size;
                //         }
                //     );
                // } else {
                //     AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.sort(
                //         function(a, b) {
                //             a = new Date(a.created_at);
                //             b = new Date(b.created_at);
                //             return a > b ? -1 : a < b ? 1 : 0;
                //         }
                //     );
                // }
                //AIZ.uploader.updateUploaderFiles();
            });
        },
        addSelectedValue: function() {
            for (var i = 0; i < AIZ.uploader.data.allFiles.length; i++) {
                if (
                    !AIZ.uploader.data.selectedFiles.includes(
                        AIZ.uploader.data.allFiles[i].id
                    )
                ) {
                    AIZ.uploader.data.allFiles[i].selected = false;
                } else {
                    AIZ.uploader.data.allFiles[i].selected = true;
                }
            }
        },
        addHiddenValue: function() {
            for (var i = 0; i < AIZ.uploader.data.allFiles.length; i++) {
                AIZ.uploader.data.allFiles[i].aria_hidden = false;
            }
        },
        allowedFileType: function() {
            if (AIZ.uploader.data.type !== "all") {
                AIZ.uploader.data.allFiles = AIZ.uploader.data.allFiles.filter(
                    function(item) {
                        return item.type === AIZ.uploader.data.type;
                    }
                );
            }
        },
        updateUploaderFiles: function() {
            $(".aiz-uploader-all").html(
                '<div class="align-items-center d-flex h-100 justify-content-center w-100"><div class="spinner-border" role="status"></div></div>'
            );

            var data = AIZ.uploader.data.allFiles;

            setTimeout(function() {
                $(".aiz-uploader-all").html(null);

                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var thumb = "";
                        var hidden = "";
                        if (data[i].type === "image") {
                            thumb =
                                '<img src="' +
                                AIZ.data.appUrl +
                                "/public/" +
                                data[i].file_name +
                                '" class="img-fit">';
                        } else {
                            thumb = '<i class="la la-file-text"></i>';
                        }
                        var html =
                            '<div class="aiz-file-box-wrap" aria-hidden="' +
                            data[i].aria_hidden +
                            '" data-selected="' +
                            data[i].selected +
                            '">' +
                            '<div class="aiz-file-box">' +
                            '<div class="dropdown-file">' +
                            '<a class="dropdown-link" data-toggle="dropdown">' +
                            '<i class="la la-ellipsis-v"></i>' +
                            "</a>" +
                            '<div class="dropdown-menu dropdown-menu-right">' +
                            '<a href="' +
                            AIZ.data.appUrl +
                            "/public/" +
                            data[i].file_name +
                            '" target="_blank" download="' +
                            data[i].file_original_name +
                            "." +
                            data[i].extension +
                            '" class="dropdown-item"><i class="la la-download mr-2"></i>Download</a>' +
                            '<a href="#" class="dropdown-item aiz-uploader-delete" data-id="' +
                            data[i].id +
                            '"><i class="la la-trash mr-2"></i>Delete</a>' +
                            "</div>" +
                            "</div>" +
                            '<div class="card card-file aiz-uploader-select" title="' +
                            data[i].file_original_name +
                            "." +
                            data[i].extension +
                            '" data-value="' +
                            data[i].id +
                            '">' +
                            '<div class="card-file-thumb">' +
                            thumb +
                            "</div>" +
                            '<div class="card-body">' +
                            '<h6 class="d-flex">' +
                            '<span class="text-truncate title">' +
                            data[i].file_original_name +
                            "</span>" +
                            '<span class="ext">.' +
                            data[i].extension +
                            "</span>" +
                            "</h6>" +
                            "<p>" +
                            AIZ.extra.bytesToSize(data[i].file_size) +
                            "</p>" +
                            "</div>" +
                            "</div>" +
                            "</div>" +
                            "</div>";

                        $(".aiz-uploader-all").append(html);
                    }
                } else {
                    $(".aiz-uploader-all").html(
                        '<div class="align-items-center d-flex h-100 justify-content-center w-100 nav-tabs"><div class="text-center"><h3>No files found</h3></div></div>'
                    );
                }
                AIZ.uploader.uploadSelect();
                AIZ.uploader.deleteUploaderFile();
            }, 300);
        },
        inputSelectPreviewGenerate: function(elem) {
            elem.find(".selected-files").val(AIZ.uploader.data.selectedFiles);
            elem.next(".file-preview").html(null);
            if (AIZ.uploader.data.selectedFiles.length > 0) {
                elem.find(".file-amount").html(
                    AIZ.uploader.updateFileHtml(AIZ.uploader.data.selectedFiles)
                );
                for (
                    var i = 0;
                    i < AIZ.uploader.data.selectedFiles.length;
                    i++
                ) {
                    var index = AIZ.uploader.data.allFiles.findIndex(
                        x => x.id === AIZ.uploader.data.selectedFiles[i]
                    );
                    var thumb = "";
                    if (AIZ.uploader.data.allFiles[index].type === "image") {
                        thumb =
                            '<img src="' +
                            AIZ.data.appUrl +
                            "/public/" +
                            AIZ.uploader.data.allFiles[index].file_name +
                            '" class="img-fit">';
                    } else {
                        thumb = '<i class="la la-file-text"></i>';
                    }
                    var html =
                        '<div class="d-flex justify-content-between align-items-center mt-2 file-preview-item" data-id="' +
                        AIZ.uploader.data.allFiles[index].id +
                        '" title="' +
                        AIZ.uploader.data.allFiles[index].file_original_name +
                        "." +
                        AIZ.uploader.data.allFiles[index].extension +
                        '">' +
                        '<div class="align-items-center align-self-stretch d-flex justify-content-center thumb">' +
                        thumb +
                        "</div>" +
                        '<div class="col body">' +
                        '<h6 class="d-flex">' +
                        '<span class="text-truncate title">' +
                        AIZ.uploader.data.allFiles[index].file_original_name +
                        "</span>" +
                        '<span class="ext">.' +
                        AIZ.uploader.data.allFiles[index].extension +
                        "</span>" +
                        "</h6>" +
                        "<p>" +
                        AIZ.extra.bytesToSize(
                            AIZ.uploader.data.allFiles[index].file_size
                        ) +
                        "</p>" +
                        "</div>" +
                        '<div class="remove">' +
                        '<button class="btn btn-sm btn-link remove-attachment" type="button">' +
                        '<i class="la la-close"></i>' +
                        "</button>" +
                        "</div>" +
                        "</div>";

                    elem.next(".file-preview").append(html);
                }
            } else {
                elem.find(".file-amount").html("Choose File");
            }
        },
        editorImageGenerate: function(elem) {
            if (AIZ.uploader.data.selectedFiles.length > 0) {
                for (
                    var i = 0;
                    i < AIZ.uploader.data.selectedFiles.length;
                    i++
                ) {
                    var index = AIZ.uploader.data.allFiles.findIndex(
                        x => x.id === AIZ.uploader.data.selectedFiles[i]
                    );
                    var thumb = "";
                    if (AIZ.uploader.data.allFiles[index].type === "image") {
                        thumb =
                            '<img src="' +
                            AIZ.data.appUrl +
                            "/public/" +
                            AIZ.uploader.data.allFiles[index].file_name +
                            '">';
                        elem[0].insertHTML(thumb);
                        // console.log(elem);
                    }
                }
            }
        },
        dismissUploader: function() {
            $("#aizUploaderModal").on("hidden.bs.modal", function() {
                $(".aiz-uploader-backdrop").remove();
                $("#aiz-uploader").remove();
            });
        },
        trigger: function(
            elem = null,
            from = "",
            type = "all",
            selectd = "",
            multiple = false
        ) {
            // $("body").append('<div class="aiz-uploader-backdrop"></div>');

            var elem = $(elem);
            var multiple = multiple;
            var type = type;
            var oldSelectedFiles = selectd;
            if (oldSelectedFiles !== "") {
                AIZ.uploader.data.selectedFiles = oldSelectedFiles
                    .split(",")
                    .map(Number);
            } else {
                AIZ.uploader.data.selectedFiles = [];
            }

            if ("undefined" !== typeof type && type.length > 0) {
                AIZ.uploader.data.type = type;
            }

            if (multiple) {
                AIZ.uploader.data.multiple = multiple;
            }

            // setTimeout(function() {
            $.post(
                AIZ.data.appUrl + "/aiz-uploader",
                { _token: AIZ.data.csrf },
                function(data) {
                    $("body").append(data);
                    $("#aizUploaderModal").modal("show");
                    AIZ.plugins.aizUppy();
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files", null, $('[name="aiz-uploader-sort"]').val()
                    );
                    AIZ.uploader.updateUploaderSelected();
                    AIZ.uploader.clearUploaderSelected();
                    AIZ.uploader.sortUploaderFiles();
                    AIZ.uploader.searchUploaderFiles();
                    AIZ.uploader.showSelectedFiles();
                    AIZ.uploader.dismissUploader();

                    $("#uploader_next_btn").on("click", function() {
                        if (AIZ.uploader.data.next_page_url != null) {
                            $('[name="aiz-show-selected"]').prop(
                                "checked",
                                false
                            );
                            AIZ.uploader.getAllUploads(
                                AIZ.uploader.data.next_page_url
                            );
                        }
                    });

                    $("#uploader_prev_btn").on("click", function() {
                        if (AIZ.uploader.data.prev_page_url != null) {
                            $('[name="aiz-show-selected"]').prop(
                                "checked",
                                false
                            );
                            AIZ.uploader.getAllUploads(
                                AIZ.uploader.data.prev_page_url
                            );
                        }
                    });

                    $(".aiz-uploader-search i").on("click", function() {
                        $(this)
                            .parent()
                            .toggleClass("open");
                    });

                    $('[data-toggle="aizUploaderAddSelected"]').on(
                        "click",
                        function() {
                            if (from === "input") {
                                AIZ.uploader.inputSelectPreviewGenerate(elem);
                            } else if (from === "editor") {
                                console.log(elem);
                                AIZ.uploader.editorImageGenerate(elem);
                            }
                            $("#aizUploaderModal").modal("hide");
                            AIZ.uploader.removeAttachment();
                        }
                    );
                }
            );
            // }, 50);
        },
        initForInput: function() {
            $('[data-toggle="aizuploader"]').on("click", function(e) {
                if (e.detail === 1) {
                    var elem = $(this);
                    var multiple = elem.data("multiple");
                    var type = elem.data("type");
                    var oldSelectedFiles = elem.find(".selected-files").val();

                    multiple = !multiple ? '' : multiple;
                    type = !type ? '' : type;
                    oldSelectedFiles = !oldSelectedFiles ? '' : oldSelectedFiles;

                    AIZ.uploader.trigger(
                        this,
                        "input",
                        type,
                        oldSelectedFiles,
                        multiple
                    );
                }
            });
        }
    };
    AIZ.plugins = {
        metismenu: function() {
            $('[data-toggle="aiz-side-menu"]').metisMenu();
        },
        bootstrapSelect: function(refresh = ''){
            $(".aiz-selectpicker").each(function(el) {
                var $this = $(this);
                $this.selectpicker({
                    size: 5,
                });
                if(refresh === 'refresh'){
                    $this.selectpicker('refresh');
                }
            });
        },
        tagify: function(){
        	$('.aiz-tag-input').each(function() {

        		var $this = $(this);

        		var maxTags = $this.data('max-tags');
        		var whitelist = $this.data('whitelist');

        		maxTags = !maxTags ? Infinity : maxTags;
        		whitelist = !whitelist ? [] : whitelist;

	        	$this.tagify({
	        		maxTags : maxTags,
	        		whitelist: whitelist,
	        		dropdown : {
						enabled: 1
					}
	        	});

	        });
        },
        textEditor: function() {
            $(".aiz-text-editor").each(function(el) {
                var $this = $(this);
                var buttons = $this.data("buttons");
                var minHeight = $this.data("min-height");
                var placeholder = $this.attr("placeholder");

                buttons = !buttons? [['font', ['bold', 'underline', 'italic', 'clear']],['para', ['ul', 'ol', 'paragraph']],['style', ['style']],['color', ['color']],['table', ['table']],['insert', ['link', 'picture', 'video']],['view', ['fullscreen','undo','redo']]] : buttons;
                placeholder = !placeholder ? '' : placeholder;
                minHeight = !minHeight ? 200 : minHeight;

                $this.summernote({
                	toolbar:buttons,
			        placeholder: placeholder,
			        height: minHeight
			    });
            });
        },
        dateRange: function(){
        	$('.aiz-date-range').each(function() {
        		var $this = $(this);
        		var today = moment().startOf('day');
        		var value = $this.val();
        		var startDate = false;
        		var minDate = false;
        		var maxDate = false;
        		var advncdRange = false;
        		var ranges = {
						'Today': [moment(), moment()],
						'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
						'Last 7 Days': [moment().subtract(6, 'days'), moment()],
						'Last 30 Days': [moment().subtract(29, 'days'), moment()],
						'This Month': [moment().startOf('month'), moment().endOf('month')],
						'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			        };

                var single = $this.data("single");
                var monthYearDrop = $this.data("show-dropdown");
                var format = $this.data("format");
                var separator = $this.data("separator");
        		var pastDisable = $this.data("past-disable");
        		var futureDisable = $this.data("future-disable");
        		var timePicker = $this.data("time-picker");
        		var timePickerIncrement = $this.data("time-gap");
        		var advncdRange = $this.data("advanced-range");

                single = !single ? false : single;
                monthYearDrop = !monthYearDrop ? false : monthYearDrop;
                format = !format ? 'Y-MM-DD' : format;
                separator = !separator ? ' / ' : separator;
                startDate = !value ? startDate : value;
                minDate = !pastDisable ? minDate : today;
                maxDate = !futureDisable ? maxDate : today;
                timePicker = !timePicker ? false : timePicker;
                timePickerIncrement = !timePickerIncrement ? 1 : timePickerIncrement;
                ranges = !advncdRange ? "" : ranges

	        	$this.daterangepicker({
					singleDatePicker: single,
					showDropdowns: monthYearDrop,
					minDate: minDate,
					maxDate: maxDate,
					startDate: startDate,
					timePickerIncrement: timePickerIncrement,
					autoUpdateInput: false,
					ranges: ranges,
					locale: {
				    	format: format,
						separator: separator,
						applyLabel: "Select",
						cancelLabel: "Clear"
				    }
	        	});
	        	if (single) {
	        		$this.on('apply.daterangepicker', function(ev, picker) {
	        			$this.val(picker.startDate.format(format));
	        		});
				}else{
		        	$this.on('apply.daterangepicker', function(ev, picker) {
						$this.val(picker.startDate.format(format) + separator + picker.endDate.format(format));
					});
		        }

				$this.on('cancel.daterangepicker', function(ev, picker) {
					$this.val('');
				});

        	});
        },
        timePicker: function(){
            $('.aiz-time-picker').each(function() {
                var $this = $(this);

                var minuteStep = $this.data("minute-step");
                var defaultTime = $this.data("default");

                minuteStep = !minuteStep ? 10 : minuteStep;
                defaultTime = !defaultTime ? '00:00' : defaultTime;

                $this.timepicker({
                    template: 'dropdown',
                    minuteStep: minuteStep,
                    defaultTime: defaultTime,
                    icons: {
                        up: 'las la-angle-up',
                        down: 'las la-angle-down',
                    },
                    showInputs: false
                });

            });
        },
        fooTable: function(){
        	$('.aiz-table').each(function() {
        		var $this = $(this);

                var empty = $this.data("empty");
                empty = !empty ? 'Nothing Found' : empty;

				$this.footable({
					breakpoints: {
						"xs": 576,
						"sm": 768,
						"md": 992,
						"lg": 1200,
						"xl": 1400
					},
					cascade: true,
					on: {
						'ready.ft.table': function(e, ft) {
							AIZ.extra.deleteConfirm();
						}
					},
                    empty: empty,
				});
        	});
        },
        notify: function(type = "dark", message = "" ) {
        	$.notify({
				// options
				message: message
			},{
				// settings
				showProgressbar: true,
				delay: 2500,
				mouse_over: 'pause',
				placement: {
					from: "bottom",
					align: "left"
				},
				animate: {
					enter: 'animated fadeInUp',
					exit: 'animated fadeOutDown'
				},
				type: type,
				template:   '<div data-notify="container" class="aiz-notify alert alert-{0}" role="alert">' +
								'<button type="button" aria-hidden="true" data-notify="dismiss" class="close"><i class="las la-times"></i></button>' +
								'<span data-notify="message">{2}</span>' +
								'<div class="progress" data-notify="progressbar">' +
									'<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
								'</div>' +
							'</div>'
			});
        },
        aizUppy: function() {
            if ($("#aiz-upload-files").length > 0) {
                var uppy = Uppy.Core({
                    autoProceed: true
                });
                uppy.use(Uppy.Dashboard, {
                    target: "#aiz-upload-files",
                    inline: true,
                    showLinkToFileUploadResult: false,
                    showProgressDetails: true,
                    hideCancelButton: true,
                    hidePauseResumeButton: true,
                    hideUploadButton: true,
                    proudlyDisplayPoweredByUppy: false
                });
                uppy.use(Uppy.XHRUpload, {
                    endpoint: AIZ.data.appUrl + "/aiz-uploader/upload",
                    fieldName: "aiz_file",
                    headers: {
                        _token: AIZ.data.csrf
                    }
                });
                uppy.on("upload-success", function() {
                    AIZ.uploader.getAllUploads(
                        AIZ.data.appUrl + "/aiz-uploader/get_uploaded_files"
                    );
                });
            }
        },
        tooltip: function() {
            $('[data-toggle="tooltip"]').tooltip();
        },
        slickCarousel: function(){
            $('.aiz-carousel').each(function() {
                var $this = $(this);

                var slidesRtl = false;

                var slidesPerViewXs = $this.data('xs-items');
                var slidesPerViewSm = $this.data('sm-items');
                var slidesPerViewMd = $this.data('md-items');
                var slidesPerViewLg = $this.data('lg-items');
                var slidesPerViewXl = $this.data('xl-items');
                var slidesPerView = $this.data('items');

                var slidesCenterMode = $this.data('center');
                var slidesArrows = $this.data('arrows');
                var slidesDots = $this.data('dots');
                var slidesRows = $this.data('rows');
                var slidesAutoplay = $this.data('autoplay');
                var slidesFade = $this.data('fade');
                var asNavFor = $this.data('nav-for');
                var infinite = $this.data('infinite');

                slidesPerView = !slidesPerView ? 1 : slidesPerView;
                slidesPerViewXl = !slidesPerViewXl ? slidesPerView : slidesPerViewXl;
                slidesPerViewLg = !slidesPerViewLg ? slidesPerViewXl : slidesPerViewLg;
                slidesPerViewMd = !slidesPerViewMd ? slidesPerViewLg : slidesPerViewMd;
                slidesPerViewSm = !slidesPerViewSm ? slidesPerViewMd : slidesPerViewSm;
                slidesPerViewXs = !slidesPerViewXs ? slidesPerViewSm : slidesPerViewXs;

                slidesCenterMode = !slidesCenterMode ? false : slidesCenterMode;
                slidesArrows = !slidesArrows ? false : slidesArrows;
                slidesDots = !slidesDots ? false : slidesDots;
                slidesRows = !slidesRows ? 1 : slidesRows;
                slidesAutoplay = !slidesAutoplay ? false : slidesAutoplay;
                slidesFade = !slidesFade ? false : slidesFade;
                asNavFor = !asNavFor ? null : asNavFor;
                infinite = !infinite ? false : infinite;

                if ($('html').attr('dir') === 'rtl') {
                    slidesRtl = true
                }

                $this.slick({
                    slidesToShow: slidesPerView,
                    autoplay: slidesAutoplay,
                    dots: slidesDots,
                    arrows: slidesArrows,
                    infinite: infinite,
                    rtl: slidesRtl,
                    rows: slidesRows,
                    centerPadding: '0px',
                    centerMode: slidesCenterMode,
                    fade: slidesFade,
                    asNavFor: asNavFor,
                    focusOnSelect: true,
                    slidesToScroll: 1,
                    prevArrow: '<button type="button" class="slick-prev"><i class="las la-angle-left"></i></button>',
                    nextArrow: '<button type="button" class="slick-next"><i class="las la-angle-right"></i></button>',
                    responsive: [
                        {
                            breakpoint: 1500,
                            settings: {
                                slidesToShow: slidesPerViewXl,
                            }
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: slidesPerViewLg,
                            }
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                slidesToShow: slidesPerViewMd,
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: slidesPerViewSm,
                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                slidesToShow: slidesPerViewXs,
                            }
                        }
                    ]
                });
            });
        }
    };
    AIZ.extra = {
    	mobileNavToggle: function(){
    		$('[data-toggle="aiz-mobile-nav"]').on('click',function(){
    			if(!$('.aiz-sidebar-wrap').hasClass('open')){
					$('.aiz-sidebar-wrap').addClass('open');
    			}else{
    				$('.aiz-sidebar-wrap').removeClass('open');
    			}
    		});
    		$('.aiz-sidebar-overlay').on('click',function(){
    			$('.aiz-sidebar-wrap').removeClass('open');
    		});
    	},
    	initActiveMenu: function(){
	        $('[data-toggle="aiz-side-menu"] a').each(function () {
	            var pageUrl = window.location.href.split(/[?#]/)[0];
	            if (this.href == pageUrl || $(this).hasClass('active')) {
	                $(this).addClass('active');
	                $(this).closest('.aiz-side-nav-item').addClass('mm-active');
	                $(this).closest('.level-2').siblings('a').addClass('level-2-active');
	                $(this).closest('.level-3').siblings('a').addClass('level-3-active');
	            }
	        });
    	},
        deleteConfirm: function() {
            $(".confirm-delete").click(function(e) {
                e.preventDefault();
                var url = $(this).data("href");
                $("#delete-modal").modal("show");
                $("#delete-link").attr("href", url);
            });
        },
        bytesToSize: function (bytes) {
            var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            if (bytes == 0) return "0 Byte";
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
        },
        multiModal: function (){
        	$(document).on('show.bs.modal', '.modal', function (event) {
		        var zIndex = 1040 + (10 * $('.modal:visible').length);
		        $(this).css('z-index', zIndex);
		        setTimeout(function() {
		            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
		        }, 0);
		    });
        },
        bsCustomFile: function (){
            $('.custom-file input').change(function (e) {
                var files = [];
                for (var i = 0; i < $(this)[0].files.length; i++) {
                    files.push($(this)[0].files[i].name);
                }
                if (files.length === 1) {
                    $(this).next('.custom-file-name').html(files[0]);
                }else if(files.length > 1){
                    $(this).next('.custom-file-name').html(files.length + ' Files Selected');
                }else{
                    $(this).next('.custom-file-name').html('Choose file');
                }
            });
        },
        inputRating: function(){
            $('.rating-input').each(function() {
                $(this).find('label').on({
                    mouseover: function(event) {
                        $(this).find('i').addClass('hover');
                        $(this).prevAll().find('i').addClass('hover');
                    },
                    mouseleave: function(event) {
                        $(this).find('i').removeClass('hover');
                        $(this).prevAll().find('i').removeClass('hover');
                    },
                    click: function(event){
                        $(this).siblings().find('i').removeClass('active');
                        $(this).find('i').addClass('active');
                        $(this).prevAll().find('i').addClass('active');
                    }
                });
                if($(this).find('input').is(':checked')){
                    $(this).find('label').siblings().find('i').removeClass('active');
                    $(this).find('input:checked').closest('label').find('i').addClass('active');
                    $(this).find('input:checked').closest('label').prevAll().find('i').addClass('active');
                }
            });
        },
        scrollToBottom: function(){
            $('.scroll-to-btm').each(function(i,el) {
                el.scrollTop = el.scrollHeight;
            });
        },
        classToggle: function(){
            $('[data-toggle="class-toggle"]').each(function() {
                var $this = $(this);
                var target = $this.data('target');
                var sameTriggers = $this.data('same');
                $this.on('click',function(){
                    if ($(target).hasClass('active')) {
                        $(target).removeClass('active');
                        $(sameTriggers).removeClass('active');
                        $this.removeClass('active');
                    }else{
                        $(target).addClass('active');
                        $this.addClass('active');
                    }
                });
            });
        },
        collapseSidebar: function(){
            $('[data-toggle="collapse-sidebar"]').each(function(i,el) {
                var $this = $(this);
                var target = $(this).data('target');
                var sameTriggers = $(this).data('siblings');

                // var showOverlay = $this.data('overlay');
                // var overlayMarkup = '<div class="overlay overlay-fixed dark c-pointer" data-toggle="collapse-sidebar" data-target="'+target+'"></div>';

                // showOverlay = !showOverlay ? true : showOverlay;

                // if (showOverlay && $(target).siblings('.overlay').length !== 1) {
                //     $(target).after(overlayMarkup);
                // }

                $(this).on('click',function(e){
                    e.preventDefault();
                    if ($(target).hasClass('opened')) {
                        $(target).removeClass('opened');
                        $(sameTriggers).removeClass('opened');
                        $($this).removeClass('opened');
                    }else{
                        $(target).addClass('opened');
                        $($this).addClass('opened');
                    }
                });
            });
        },

    };



    // init aiz plugins, extra options
	AIZ.extra.initActiveMenu();
	AIZ.extra.mobileNavToggle();
	AIZ.extra.deleteConfirm();
	AIZ.extra.multiModal();
    AIZ.extra.inputRating();
    AIZ.extra.bsCustomFile();
    AIZ.extra.scrollToBottom();
    AIZ.extra.classToggle();
    AIZ.extra.collapseSidebar();

	AIZ.plugins.metismenu();
	AIZ.plugins.bootstrapSelect();
	AIZ.plugins.tagify();
	AIZ.plugins.textEditor();
    AIZ.plugins.tooltip();
    AIZ.plugins.dateRange();
    AIZ.plugins.timePicker();
    AIZ.plugins.fooTable();
    AIZ.plugins.slickCarousel();


    // initialization of aiz uploader
    AIZ.uploader.initForInput();
    AIZ.uploader.removeAttachment();



})(jQuery);
