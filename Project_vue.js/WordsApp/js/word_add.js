var vm_1 = new Vue({
    el: "#app_add1",
    data: {
        word: {
            "No": 0,
            "kannji": '',
            "kana": '',
            "yimi": '',
            "type": '',
            "error": '0',
            "correct": '0',
            "intime": new Date().toLocaleDateString()
        }
    },
    filters: {

    },
    mounted: function () {
        $('select').selected();
    },
    methods: {
        addToWebSql: function () {
            var _this = this;
            _this.word.type = $('#wordtype').val();
            if (_this.word.kannji == '' ||
                _this.word.kana == '' ||
                _this.word.yimi == '' ||
                _this.word.type == '') {
                alert('请检查输入');
                return;

            }
            var request = getDB();
            var db;
            request.onsuccess = function (event) {
                db = request.result;
                console.log('数据库打开成功:addToWebSql...');
                var tx = db.transaction('wordslist', 'readwrite');
                var store = tx.objectStore('wordslist');
                var lowerRange = IDBKeyRange.lowerBound(1);
                var req = store.openCursor(lowerRange, 'prevunique');
                req.onsuccess = function () {
                    var cursor = this.result;
                    if (cursor) {
                        _this.word.No = parseInt(cursor.value.No) + 1;
                        console.log("获取No:" + _this.word.No + "...");
                        console.log("准备写入数据：");
                        console.log(_this.word);
                        var req1 = store.add(_this.word);
                        req1.onsuccess = function (event) {
                            console.log('数据写入成功:addToWebSql...');
                            db.close();
                            alert('单词录入成功');
                        };
                        req1.onerror = function (event) {
                            console.log('数据写入失败:addToWebSql...');
                            db.close();
                            alert('单词录入失败');
                        }
                    }
                }
                req.onerror = function () {
                    console.log("获取No失败...");
                }

            };
            request.onupgradeneeded = function (event) {
                alert('本地数据库不存在，请先导入单词。');
                db.close();
            }
        },
        clearInput: function () {
            this.word.kannji = "";
            this.word.kana = "";
            this.word.yimi = "";
            $('#wordtype').find('option[value="2"]').attr('selected', true);
            $('#wordtype').selected();
        }
    }
});
var vm_2 = new Vue({
    el: "#app_add2",
    data: {
    },
    filters: {

    },
    mounted: function () {
    },
    methods: {
        getFileName: function () {
            var file = document.getElementById("files").files[0];
            var name = file.name;
            var fileNames = '';
            fileNames = '<span class="am-badge">' + name + '</span> ';
            $('#file-list').html(fileNames);
        },
        readFileAndInsert: function () {
            var selectedFile = document.getElementById("files").files[0];//获取读取的File对象
            if (!selectedFile) {
                alert("选择文件");
                return;
            }
            var name = selectedFile.name;//读取选中文件的文件名
            var size = selectedFile.size;//读取选中文件的大小
            console.log("文件名:" + name + "大小：" + size);

            var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
            reader.readAsText(selectedFile);//读取文件的内容
            var filecontent = "";
            reader.onload = function () {
                filecontent = this.result;//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
                var enterIndex, current, left;
                var no, kannji, kana, yimi, type, correct, error, intime;
                var wordslist = [];
                while (filecontent.length != 0) {
                    enterIndex = filecontent.indexOf("\n");
                    if (enterIndex == -1) {
                        current = filecontent;
                        filecontent = "";
                    } else {
                        current = filecontent.substr(0, enterIndex);
                        filecontent = filecontent.substr(enterIndex + 1);
                    }
                    if (current.indexOf("No") == -1) {
                        var record = current.split(",");
                        wordslist.push({
                            "No": parseInt(record[0]),
                            "kannji": record[1],
                            "kana": record[2],
                            "yimi": record[3],
                            "type": record[4],
                            "correct": record[5],
                            "error": record[6],
                            "intime": new Date(record[7]).toLocaleDateString()
                        });
                    }
                }
                var request = getDB();
                var db;
                request.onsuccess = function (event) {
                    db = event.target.result;
                    console.log('数据库打开成功 -- onsuccess');
                    wordslist.forEach(function (element) {
                        var tx = db.transaction('wordslist', 'readwrite');
                        var store = tx.objectStore('wordslist');
                        var req1 = store.add(element);
                        req1.onsuccess = function (event) {
                            console.log('数据写入成功');
                        };
                        req1.onerror = function (event) {
                            console.log('数据写入失败');
                        }
                    }, this);
                    db.close();
                };
                request.onupgradeneeded = function (event) {
                    db = event.target.result;
                    var objectStore;
                    if (!db.objectStoreNames.contains('wordslist')) {
                        objectStore = db.createObjectStore('wordslist', { keyPath: 'No' });
                    }
                    console.log('数据库创建成功 -- onupgradeneeded');
                    db.close();
                }
            };
        },
        saveToLocalCSV: function () {

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