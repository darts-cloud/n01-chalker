window.onload = function(){
  let autochange = document.getElementById("autochange");

  // initialize
  var init = function(){
    autochange.checked = true;
    chrome.storage.sync.get(['autochange'], function (items) {
      if (items.autochange != undefined) {
        autochange.checked = items.autochange;
      }
    });
  };
  init();

  // set save event
  autochange.addEventListener("change", function(){
    chrome.storage.sync.set({'autochange': autochange.checked}, function () {
    });
  });
}