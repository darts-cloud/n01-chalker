/* ========================================== 
  [[[TODO]]]
・対戦相手のターンはOFFにすること。
・60でーすなどをくみ取れるようにする。
・n01のサイトを複数タブで開くと、常にCPU使用率が100％となる。
・
============================================ */

class n01Mic {

    constructor() {
        
        const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
        const rec = new SpeechRecognitionClass();
        // rec.grammars = getGrammerList();

        rec.maxAlternatives = 10;
        
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'ja-JP';

        let obj = this;
        rec.onresult = (event) => {
            let str = "";
            for (let idx in event.results[0]) {
                let elm = event.results[0][idx];
                if (elm.confidence != undefined) {
                    let point = elm.transcript;
                    console.log(point);
                    let reg = /([0-9])本目 *です。*$/;
                    if (reg.test(point)) {
                        point = point.replace("です", "").trim();
                        point = point.replace("。", "").trim();
                        point = point.replace("本目", "").trim();
            
                        reg = /([0-9]+$)/;
                        let mat = point.match(reg);
                        if (mat.length <= 0) {
                            return;
                        }
                        point = point.match(reg)[0];
                        
                        obj.setHonme(mat[0]);
                        return;
                    }
                    reg = /(オーケー|OK) *です。*$/;
                    if (reg.test(point)) {
                        obj.pressOK();
                        return;
                    }
                    reg = /(お願いします)。*$/;
                    if (reg.test(point)) {
                        obj.pressOK();
                        return;
                    }
                    reg = /(キャンセル) *です。*$/;
                    if (reg.test(point)) {
                        obj.pressCancel();
                        return;
                    }
                    reg = /([0-9])+ *(点です|点|てん|です)+。*$/;
                    if (reg.test(point)) {
                        point = point.replace("点", "").trim();
                        point = point.replace("てん", "").trim();
                        point = point.replace("です", "").trim();
                        point = point.replace("。", "").trim();
            
                        reg = /([0-9]+$)/;
                        let mat = point.match(reg);
                        if (mat.length <= 0) {
                            return;
                        }
                        
                        obj.setPoint(mat[0]);
                        return;
                    }
                    // str += elm.transcript + " : " + elm.confidence.toPrecision(2) + "\n";
                }
            }
            
            // alert(str);
        }
        rec.onend = () => { rec.start() };
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
    
    /* ======================== */
    /* functions
    /* ======================== */
    run () {
        rec.start();
    }
    setPoint(point) {
        if (!this.isNumber(point)) {
            return;
        }
        $('.input_area').text(point);
        document.dispatchEvent( new KeyboardEvent( "keydown",{key: "Tab" })) ;
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
    let mic = new n01Mic();
    mic.run();
});
