
  function drawElements () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawThis.shape(shape1)
    drawThis.shape(shape2)
    movePlayer1()
    movePlayer2()
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

function movePlayer1 (player) {
  //up
  if (keyListener.keyList()['87']) {
    shape1.y += -2
  }
  //down
  if (keyListener.keyList()['83']) {
    shape1.y += 2
  }
  //left
  if (keyListener.keyList()['65']) {
    shape1.x += -2
  }
  //right
  if (keyListener.keyList()['68']) {
    shape1.x += 2
  }
}

function movePlayer2 (e) {
  //up
  if (keyListener.keyList()['38']) {
    shape2.y += -2
  }
  //down
  if (keyListener.keyList()['40']) {
    shape2.y += 2
  }
  //left
  if (keyListener.keyList()['37']) {
    shape2.x += -2
  }
  //right
  if (keyListener.keyList()['39']) {
    shape2.x += 2
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



















































