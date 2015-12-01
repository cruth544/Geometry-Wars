
  function drawElements () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawThis.shape(shape1)
    drawThis.shape(shape2)
    movePlayer(shape1)
    movePlayer(shape2)
  }


////////////////////////////KEY LISTENERS///////////////////////////////
$(document).keydown(function(e) {
  keyListener.down(e)
})
$(document).keyup(function(e) {
  keyListener.up(e)
})

var keyListener = (function () {
  var keys = {}

  return {
    down: function (e) {
      keys[e.which] = true
      e.preventDefault()
      printKeys()
    },
    up: function (e) {
      delete keys[e.which]
      printKeys()
    },
    keyList: function () {
      return keys
    }
  }
})()

function movePlayer (player) {
  //up
  if (keyListener.keyList()[player.controls.up]) {
    player.y += -2
  }
  //down
  if (keyListener.keyList()[player.controls.down]) {
    player.y += 2
  }
  //left
  if (keyListener.keyList()[player.controls.left]) {
    player.x += -2
  }
  //right
  if (keyListener.keyList()[player.controls.right]) {
    player.x += 2
  }
}

function printKeys() {
    var html = '';
    for (var i in keyListener.keyList()) {
        if (!keyListener.keyList().hasOwnProperty(i)) continue;
        html += ' ' + i;
    }
    $('#out').html(html);
}


setInterval(drawElements, 1000 / 60)



















































