/*
 * Copyright (c) 2015 Robert Girhiny. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var PreferencesManager          = brackets.getModule("preferences/PreferencesManager"),
        CommandManager              = brackets.getModule("command/CommandManager"),
        KeyBindingManager           = brackets.getModule("command/KeyBindingManager"),
        ExtensionUtils              = brackets.getModule("utils/ExtensionUtils"),
        EditorManager               = brackets.getModule("editor/EditorManager"),
        _                           = brackets.getModule("thirdparty/lodash");


    // load our styles
    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    /* Our extension's preferences */
    var prefs = PreferencesManager.getExtensionPrefs("numberedBookmarks");
    // define prefs
    prefs.definePreference("bm",  "object", {});

    /* Variable that stores line coords */
    var bm = {};



    function addhotkey(commandId, menuName, handler, shortcut, shortcutMac) {
        CommandManager.register(menuName, commandId, handler);
        KeyBindingManager.addBinding(commandId,
            [
                {key: shortcut, platform: "win"},
                {key: shortcut, platform: "linux"},
                {key: shortcutMac, platform: "mac"},
            ]
        );
        //KeyBindingManager.addBinding(commandId, shortcut);
    }
    addhotkey("bracketsEditorBookmarks.deleteallbookmark",     "delete all bookmark",       function() {deleteAllBookmark()},   "Ctrl-Shift-Alt-Delete", "Cmd-ALT-Delete");
    addhotkey("bracketsEditorBookmarks.setbookmark1",     "set #1",       function() {setBookmark(1)},   "Ctrl-Shift-Alt-1", "Cmd-SHIFT-ALT-1");
    addhotkey("bracketsEditorBookmarks.setbookmark2",     "set #2",       function() {setBookmark(2)},   "Ctrl-Shift-Alt-2", "Cmd-SHIFT-ALT-2");
    addhotkey("bracketsEditorBookmarks.setbookmark3",     "set #3",       function() {setBookmark(3)},   "Ctrl-Shift-Alt-3", "Cmd-SHIFT-ALT-3");
    addhotkey("bracketsEditorBookmarks.setbookmark4",     "set #4",       function() {setBookmark(4)},   "Ctrl-Shift-Alt-4", "Cmd-SHIFT-ALT-4");
    addhotkey("bracketsEditorBookmarks.setbookmark5",     "set #5",       function() {setBookmark(5)},   "Ctrl-Shift-Alt-5", "Cmd-SHIFT-ALT-5");
    addhotkey("bracketsEditorBookmarks.setbookmark6",     "set #6",       function() {setBookmark(6)},   "Ctrl-Shift-Alt-6", "Cmd-SHIFT-ALT-6");
    addhotkey("bracketsEditorBookmarks.setbookmark7",     "set #7",       function() {setBookmark(7)},   "Ctrl-Shift-Alt-7", "Cmd-SHIFT-ALT-7");
    addhotkey("bracketsEditorBookmarks.setbookmark8",     "set #8",       function() {setBookmark(8)},   "Ctrl-Shift-Alt-8", "Cmd-SHIFT-ALT-8");
    addhotkey("bracketsEditorBookmarks.setbookmark9",     "set #9",       function() {setBookmark(9)},   "Ctrl-Shift-Alt-9", "Cmd-SHIFT-ALT-9");
    addhotkey("bracketsEditorBookmarks.bookmark1",        "#1",           function() {bookmark(1)},      "Ctrl-1", "Cmd-1");
    addhotkey("bracketsEditorBookmarks.bookmark2",        "#2",           function() {bookmark(2)},      "Ctrl-2", "Cmd-2");
    addhotkey("bracketsEditorBookmarks.bookmark3",        "#3",           function() {bookmark(3)},      "Ctrl-3", "Cmd-3");
    addhotkey("bracketsEditorBookmarks.bookmark4",        "#4",           function() {bookmark(4)},      "Ctrl-4", "Cmd-4");
    addhotkey("bracketsEditorBookmarks.bookmark5",        "#5",           function() {bookmark(5)},      "Ctrl-5", "Cmd-5");
    addhotkey("bracketsEditorBookmarks.bookmark6",        "#6",           function() {bookmark(6)},      "Ctrl-6", "Cmd-6");
    addhotkey("bracketsEditorBookmarks.bookmark7",        "#7",           function() {bookmark(7)},      "Ctrl-7", "Cmd-7");
    addhotkey("bracketsEditorBookmarks.bookmark8",        "#8",           function() {bookmark(8)},      "Ctrl-8", "Cmd-8");
    addhotkey("bracketsEditorBookmarks.bookmark9",        "#9",           function() {bookmark(9)},      "Ctrl-9", "Cmd-9");


    /**
    * Delete all bookmark in the current document
    */
    function deleteAllBookmark() {
        var editor = EditorManager.getCurrentFullEditor();
        if (editor) {
            var cm = editor._codeMirror,
                path = editor.document.file.fullPath,
                y=0;

            cm.eachLine(function(line){
                if (line.wrapClass && line.wrapClass.indexOf("bookmark")>-1) {
                    cm.removeLineClass(y, "wrap", "bookmark");
                    for (var j=1; j<=9; j++) {
                        cm.removeLineClass(y, "wrap", "bookmark-"+j);
                    }
                }
                y++;
            });
            for (var i=1; i<10; i++) {
                bm[path][i] = null;
            }
            prefs.set("bm", bm);
        }
    }

    /**
    * Set a bookmark
    */
    function setBookmark(i) {
        var editor = EditorManager.getCurrentFullEditor();
        if (editor) {
            var cursor = editor.getCursorPos(),
                x = cursor.ch,
                y = cursor.line,
                cm = editor._codeMirror,
                lineInfo = cm.lineInfo(cursor.line),
                path = editor.document.file.fullPath;

            if (!lineInfo.wrapClass || lineInfo.wrapClass.indexOf("bookmark") === -1) {
                if(typeof bm[path] === 'undefined') {
                    bm[path] = [];
                }
                if (bm[path][i]) {
                    cm.removeLineClass(bm[path][i].y, "wrap", "bookmark bookmark-"+i);
                }

                bm[path][i] = {x:x, y:y};
                prefs.set("bm", bm);
                cm.addLineClass(y, "wrap", "bookmark bookmark-"+i);
            } else { //van bookmark abban a sorban
                if (lineInfo.wrapClass.indexOf("bookmark-"+i) === -1) { //nem ugyanaz a bookmark tehát ez is egy hozzáadás
                    //az adott helyen lévő össes bookmarkot leszedjük
                    for (var j=1; j<=9; j++) {
                        if (lineInfo.wrapClass.indexOf("bookmark-"+j) !== -1) {
                            bm[path][j] = null;
                        }
                        cm.removeLineClass(y, "wrap", "bookmark-"+j);
                    }
                    cm.removeLineClass(y, "wrap", "bookmark");
                    if (bm[path][i]) {
                        cm.removeLineClass(bm[path][i].y, "wrap", "bookmark bookmark-"+i); //töröljük a régi helyéről
                    }
                    cm.addLineClass(y, "wrap", "bookmark bookmark-"+i);
                    bm[path][i] = {x:x, y:y};
                    prefs.set("bm", bm);
                } else {
                    bm[path][i] = null;
                    prefs.set("bm", bm);
                    cm.removeLineClass(y, "wrap", "bookmark bookmark-"+i);
                }
            }
        }
    }

    /**
    * Center editor scroll
    */
    function center(cm, line) {
        var h = cm.getScrollInfo().clientHeight;
        var coords = cm.charCoords({line: line, ch: 0}, "local");
        cm.scrollTo(null, (coords.top + coords.bottom - h) / 2);
    }

    /**
    * Jump to a bookmark
    */
    function bookmark(i) {
        var editor = EditorManager.getCurrentFullEditor();
        var path = editor.document.file.fullPath;

        if(typeof bm[path] === 'undefined') {
            return;
        }
        if(typeof bm[path][i] === 'undefined' || !typeof bm[path][i]) {
            return;
        }
        if (bm[path][i]==null) {
            return;
        }

        var cm = editor._codeMirror;

        //igazítás
        var lineNumber=0;
        var found = false;
        cm.eachLine(function(line){
            if (line.wrapClass && line.wrapClass.indexOf("bookmark-"+i)>-1) {
                found = true;
                if (lineNumber!=bm[path][i].y) {
                    bm[path][i].y = lineNumber;
                    prefs.set("bm", bm);
                }
                return false;
            }
            lineNumber++;
        });
        if (!found) {
            bm[path][i] = null;
            return;
        }

        editor.setCursorPos(bm[path][i].y, bm[path][i].x);

        center(cm, bm[path][i].y);
        cm.addLineClass(bm[path][i].y, "wrap", "bookmark-notify");
        setTimeout(function () {
            cm.removeLineClass(bm[path][i].y, "wrap", "bookmark-notify");
        }, 400);
    }

    /**
     * Loads the cached bookmarks into the specified editor instance
     * @param {Editor=} editor - brackets editor instance. current editor if null
     */
    function loadBookmarks(editor) {
        if (!editor) {
            editor = EditorManager.getCurrentFullEditor();
        }
        if (editor) {
            var cm = editor._codeMirror,
                bmOne = bm[editor.document.file.fullPath];

            if (bmOne) {
                for (var i=1; i<10; i++) {
                    if (bmOne[i] && bmOne[i].y < cm.doc.lineCount()) {
                        cm.addLineClass(bmOne[i].y, "wrap", "bookmark bookmark-"+i);
                    }
                };
            }
        }
    }

    /**
     * Saves bookmarks to the data model for the specified editor instance
     * @param {Editor=} editor - brackets editor instance. current editor if null
     */
    function saveBookmarks(editor) {
        if (!editor) {
            editor = EditorManager.getCurrentFullEditor();
        }
        if (editor) {
            var cm = editor._codeMirror;
            var lineNumber=0;
            var found = [];
            cm.eachLine(function(line){
                if (line.wrapClass && line.wrapClass.indexOf("bookmark")>-1) {
                    for (var i=1; i<10; i++) {
                        if (line.wrapClass.indexOf("bookmark-"+i)) {
                            found[i] = true;
                            if (lineNumber!=bm[path][i].y) {
                                bm[path][i].y = lineNumber;
                            }
                        }
                    }
                }
                lineNumber++;
            });

            for (var i=1; i<10; i++) {
                if (typeof found[i] === 'undefined') {
                    bm[path][i] = null;
                }
            }
            prefs.set("bm", bm);
        }
    }

    _.assign(bm, prefs.get("bm"));

    EditorManager.on("_fullEditorCreatedForDocument", function (e, document, editor) {
        editor.on("beforeDestroy.bookmarks", function () {
            saveBookmarks(editor);
        });
        loadBookmarks(editor);
    });
});
