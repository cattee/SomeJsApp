var vm = new Vue({
    el: "#app_moxie",
    data: {
        moxie_list: [],
        moxie_count: 10,
    },
    filters: {

    },
    mounted: function () {
        this.getWordsList(this.moxie_count);
    },
    methods: {
        getWordsList: function (count) {
            var _this = this;
            var request = getDB();
            var db;
            var res;
            request.onsuccess = function (event) {
                db = request.result;
                var tx = db.transaction('wordslist', 'readwrite');
                var store = tx.objectStore('wordslist');
                var lowerRange = IDBKeyRange.lowerBound(1);
                var req = store.openCursor(lowerRange, 'prevunique');
                req.onsuccess = function () {
                    var cursor = this.result;
                    if (cursor) {
                        console.log("获取No：" + (parseInt(cursor.value.No) + 1));
                        res = parseInt(cursor.value.No);
                        var arr = getRandomNum(1, res, 10);
                        console.log(arr);
                        // _this.getWordsListFromDB(arr);
                    }
                }
                req.onerror = function () {
                    console.log("获取No失败...");
                    db.close();
                }
            };
        },
        getWordsListFromDB: function (arr) {
            var _this = this;
            var request = getDB();
            var db;
            request.onsuccess = function (event) {
                db = event.target.result;
                var tx = db.transaction('wordslist', 'readwrite');
                var store = tx.objectStore('wordslist');
                var lowerRange = IDBKeyRange.lowerBound(1);
                var req = store.openCursor(lowerRange, 'prevunique');
                req.onsuccess = function () {
                    var cursor = this.result;
                    if (cursor) {
                        if (ifInArray(cursor.value.No, arr)) {
                            _this.moxie_list.push({
                                "wordid": cursor.value.No,
                                "kannji": cursor.value.kannji,
                                "options": ["A" + cursor.value.yimi, "B" + cursor.value.yimi, "C" + cursor.value.yimi, "D" + cursor.value.yimi],
                            });
                            cursor.continue();
                        } else {
                            cursor.continue();
                        }
                    } else {
                        console.log('检索结束');
                        console.log(_this.moxie_list);
                    }
                }
                db.close();
            };
        }
    }

});

function getDB() {
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    if (!indexedDB) {
        showNotification("你的浏览器不支持IndexedDB", "danger");
    } else {
        return indexedDB.open("wordsapp", "1.0");
    }
}

function getRandomNum(min, max, count) {
    var arr = new Array();
    var num;
    while (arr.length < count) {
        num = parseInt(Math.random() * (max - min + 1) + min);
        if (arr.length == 0) {
            arr.push(num);
            continue;
        }
        for (j = 0; j < arr.length; j++) {
            if (arr[j] != num) {
                if (j == arr.length - 1) {
                    arr.push(num)
                    break;
                }
                continue;
            } else {
                break;
            }
        }
    }
    console.log("随机数组：" + arr)
    return arr;
}

function ifInArray(num, arr) {
    for (var index = 0; index < arr.length; index++) {
        if (num == arr[index]) {
            return true;
        } else {
            continue;
        }
    }
    return false;
}
function getMaxNumInDB() {
    var request = getDB();
    var db;
    var res;
    request.onsuccess = function (event) {
        db = request.result;
        var tx = db.transaction('wordslist', 'readwrite');
        var store = tx.objectStore('wordslist');
        var lowerRange = IDBKeyRange.lowerBound(1);
        var req = store.openCursor(lowerRange, 'prevunique');
        req.onsuccess = function () {
            var cursor = this.result;
            if (cursor) {
                console.log("获取No：" + (parseInt(cursor.value.No) + 1));
                res = parseInt(cursor.value.No);
                var arr = getRandomNum(1, res, 10);
                getWordsListFromDB(arr);
            }
        }
        req.onerror = function () {
            console.log("获取No失败...");
            db.close();
        }
    };
}
function getWordsListFromDB(arr) {
    var request = getDB();
    var db;
    request.onsuccess = function (event) {
        db = event.target.result;
        var tx = db.transaction('wordslist', 'readwrite');
        var store = tx.objectStore('wordslist');
        var lowerRange = IDBKeyRange.lowerBound(1);
        var req = store.openCursor(lowerRange, 'prevunique');
        req.onsuccess = function () {
            var cursor = this.result;
            if (cursor) {
                if (ifInArray(cursor.value.No, arr)) {
                    console.log("--" + cursor.value.No);
                    cursor.continue();
                } else {
                    // console.log(cursor.value.No + " not in array");
                    cursor.continue();
                }
            } else {
                console.log('检索结束');
            }
        }
        db.close();
    };
}
