/* ========================================== 
  [[[TODO]]]
・オンライン対戦
  ・観戦中はオフとすること。
============================================ */

class n01Calker {
    
    constructor() {
        this.hash_id = '_' + Math.random().toString(36).substr(2);
    
        console.log(this.hash_id);
        // set hash_id
        var defaults = {
            hash: this.hash_id
        };
        chrome.storage.sync.set(defaults, function() {});
        this.enable = true;
        this.inputFlg = false;
        this.disableFlg = false;
        this.gameShotFlg = false;

        this.loadSettings();

        const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
        this.rec = new SpeechRecognitionClass();
        // this.rec.grammars = getGrammerList();

        this.rec.maxAlternatives = 10;
        this.rec.continuous = false;
        this.rec.interimResults = false;
        this.rec.lang = 'ja-JP';
        // onendのstartが不要な可能性
        // this.rec.continuous = true;
        
        // イベント設定
        this.addEvent();
    }
    loadSettings() {
        let self = this;
        chrome.storage.sync.get(['autochange'], function(items) {
            self.autochange = true;
            if (items.autochange != undefined) {
                self.autochange = items.autochange;
            }
        });
    }
    addEvent() {
        // イベント設定
        this.rec.onresult = (event) => {
            console.log("onresult");
            if (this.isOpponentsTurn()) {
                console.log("isOpponentsTurn");
                return;
            }
            if (this.disableFlg){
                console.log("disabled");
                return;
            }
        //            if (this.isOpponentsTalking()) {
        //                return;
        //            }
            this.inputFlg = false;
            if (this.analysis(event)) {
                this.inputFlg = true;
            }
        }
        this.rec.onend = (event) => {
            if ( this.enable ) {
                let self = this;
                // if (self.inputFlg && !self.gameShotFlg) {
                //     setTimeout(function(){
                //         self.rec.start();
                //     }, 12000);
                // } else {
                //     self.rec.start();
                // }
                self.rec.start();
                self.inputFlg = false;
                self.gameShotFlg = false;
            } 
        }
        let table = document.querySelector("#score_table");
        if (table != undefined) {
            let self = this;
            this.mo = new MutationObserver((mutations) => {
                let cls = "p" + self.getPlayer();
                if (mutations[0].target.className.includes(cls)) {
                    // player turn is nocheck.
                    console.log("player turn is nocheck.");
                    return;
                }
                
                // you requird 時になぜか入ってしまうため、コメントアウト
                // if (self.isOpenMenuFinish()) {
                //     // an opponent game shot.
                //     console.log("an opponent game shot.");
                //     return;
                // }
                
                // If entered by an opponent, 
                // it will be disabled for a while.
                self.disableFlg = true;
                console.log("self.disableFlg = true;");
                setTimeout(function(){
                    self.disableFlg = false;
                }, 7000);
            });
            var config = {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: [ "className" ]
            };
            this.mo.observe(table, config);
        }
    }
    
    /* ======================== */
    /* html analsys functions
    /* ======================== */
    isOpenMenuFinish() {
        if ($('#menu_finish').is(':visible')) {
            return true;
        }
        return false;
    }

    /**
     * get Player Number.
     * @returns 
     */
    getPlayer() {
        let id = $("#mic_on").parents(".score_left_big").attr("id");
        if (id == "p1left_big_td") {
            return 1;
        }
        return 2;
    }

    /**
     * is Opponents Talking.
     * *unused
     * @returns 
     */
    isOpponentsTalking() {
        let opponentsPlayerNumber = 2;
        if (this.getPlayer() == 2) {
            opponentsPlayerNumber = 2;
        }
        let selector = "p" + opponentsPlayerNumber + "left_big_td";
        if ($("#" + selector).css("background-color") == 'rgba(0, 0, 0, 0)') {
            return false;
        }
        return true;
    }
    
    isOpponentsTurn() {
        return $(".input_area").hasClass('loding');
    }
    
    /* ======================== */
    /* functions
    /* ======================== */
    run () {
        this.rec.start();
    }

    stop () {
        console.log(this.hash_id + " stop.");
        this.enable = false;
        this.rec.abort();
    }
    
    analysis(event) {
        let str = "";
        for (let idx in event.results[0]) {
            if (this.isOpponentsTurn()) {
                console.log("analysis isOpponentsTurn");
            }
            let elm = event.results[0][idx];
            if (elm.confidence != undefined) {
                let point = elm.transcript;
                let confience = elm.confidence;
                console.log(point + " : " + confience);
                let reg = /([0-9])本目 *(です)*。*$/;
                if (reg.test(point)) {
                    point = point.replace("です", "").trim();
                    point = point.replace("。", "").trim();
                    point = point.replace("本目", "").trim();

                    reg = /([0-9]+$)/;
                    let mat = point.match(reg);
//                    if (mat.length <= 0) {
//                        return;
//                    }
                    
                    this.setHonme(mat[0]);
                    return true;
                }
                reg = /(オーケー|OK)$/;
                if (reg.test(point)) {
                    this.pressOK();
                    return true;
                }
                // reg = /(オーケー|OK) *です。*$/;
                // if (reg.test(point)) {
                //     this.pressOK();
                //     return;
                // }
                reg = /(お願いします)。*$/;
                if (reg.test(point)) {
                    this.pressOK();
                    return true;
                }
                reg = /(キャンセル) *です。*$/;
                if (reg.test(point)) {
                    this.pressCancel();
                    return true;
                }
                // reg = /([0-9])+ *(です)*。*$/;
                reg = /([0-9])+ *(点|てん|です)*。*$/;
                if (reg.test(point)) {
                    point = point.replace("点", "").trim();
                    point = point.replace("てん", "").trim();
                    point = point.replace("時", "").trim();
                    point = point.replace("です", "").trim();
                    point = point.replace("。", "").trim();
        
                    reg = /([0-9]+$)/;
                    let mat = point.match(reg);
//                    if (mat.length <= 0) {
//                        return;
//                    }
                    
                    this.setPoint(mat[0]);
                    return true;
                }
                reg = /ノースコア$/;
                if (reg.test(point)) {
                    this.setPoint(0);
                    return true;
                }
            }
        }
        return false;
        // alert(str);
    }
    setPoint(point) {
        if (!this.isNumber(point)) {
            return;
        }
        $('.input_area').text(point);
        if (this.autochange) {
            document.dispatchEvent( new KeyboardEvent( "keydown",{key: "Tab" })) ;
        }
    }
    
    pressOK() {
        document.dispatchEvent( new KeyboardEvent( "keydown",{key: "Enter" })) ;
    }
    
    pressCancel() {
        document.dispatchEvent( new KeyboardEvent( "keydown",{key: "Esc" })) ;
    }
    
    setHonme(hon) {
        if (hon <= 0 || 4 <= hon) {
            return;
        }
        this.gameShotFlg = true;
        if (this.isOpenMenuFinish()) {    
            document.dispatchEvent( new KeyboardEvent( "keydown",{ key: "f" })) ;
        }
        document.dispatchEvent( new KeyboardEvent( "keydown",{key: hon })) ;
    }
    
    isNumber(str) {
        let reg = new RegExp(/^[0-9]*$/);
        return reg.test(str);
    }
    
    getGrammerList() {
        let grammar =
        '#JSGF V1.0 JIS ja; grammar numbers; public <number> = (0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20'+
                         '|21|22|23|24|25|26|27|28|29|30'+
                         '|31|32|33|34|35|36|37|38|39|40'+
                         '|41|42|43|44|45|46|47|48|49|50'+
                         '|51|52|53|54|55|56|57|58|59|60'+
                         '|61|62|63|64|65|66|67|68|69|70'+
                         '|71|72|73|74|75|76|77|78|79|80'+
                         '|81|82|83|84|85|86|87|88|89|90'+
                         '|91|92|93|94|95|96|97|98|99|100'+
                         '|101|102|103|104|105|106|107|108|109|110'+
                         '|111|112|113|114|115|116|117|118|119|120'+
                         '|121|122|123|124|125|126|127|128|129|130'+
                         '|131|132|133|134|135|136|137|138|139|140'+
                         '|141|142|143|144|145|146|147|148|149|150'+
                         '|151|152|153|154|155|156|157|158|159|160'+
                         '|161|162|164|165|167|168|170'+
                         '|171|174|177|180|1本目|2本目|3本目)(点|点です|です);';

        const SpeechGrammarListClass = window.webkitSpeechGrammarList || window.SpeechGrammarList;
        const speechRecognitionList = new SpeechGrammarListClass();
        speechRecognitionList.addFromString(grammar, 1.0);
//        grammar =
//            '#JSGF V1.0 JIS ja; grammar numbers; ' +
//            ' public <numbers> = 九九;';
//        speechRecognitionList.addFromString(grammar, 0.1);
//        
//        grammar =
//            '#JSGF V1.0 JIS ja; grammar honnme; ' +
//            ' public <honnme> = 1本目|2本目|3本目;';
//        speechRecognitionList.addFromString(grammar, 1.0);
        return speechRecognitionList;
    }

}

$(function(){
    let n01calker = new n01Calker();
    n01calker.run();

    // hash_id in storage changed
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (n01calker == null) {
            return;
        }
        if (namespace == "sync") {
            if (changes.hash) {
                if (changes.hash.newValue != n01calker.hash_id) {
                    n01calker.stop();
                    n01calker = null;
                }
            }
        }
    });
});

