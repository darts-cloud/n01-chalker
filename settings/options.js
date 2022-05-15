window.onload = function(){
  let btn = document.getElementById("btn-save");

  // initialize
  var init = function(){
    let autochange = document.getElementById("autochange");
    autochange.checked = true;
    chrome.storage.sync.get(['autochange'], function (items) {
      if (items.autochange != undefined) {
        autochange.checked = items.autochange;
      }
    });
  };
  init();

  // set save event
  btn.addEventListener("click", function(){
    let autochange = document.getElementById("autochange");
    chrome.storage.sync.set({'autochange': autochange.checked}, function () {
    });
  });
}