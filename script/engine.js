
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
  var keys    = keyListener.keyList()
  var control = player.controls
  var counter = 0
  var d       = player.speed
  var diagonal   = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / 2
  function setDiagonal () {
    dx = diagonal
    dy = diagonal
  }

  if (keys[control.shoot]) {
    player.shoot()
  }
  if (keys[control.up]) {
    if (keys[control.left]) {
      setDiagonal()
    } else if (keys[control.right]) {
      setDiagonal()
    }
    player.y += -dy
  }
  if (keys[control.down]) {
    if (keys[control.left]) {
      setDiagonal()
    } else if (keys[control.right]) {
      setDiagonal()
    }
    player.y += -dy
  }
  if (keys[control.left]) {
    player.x += -dx
  }
  if (keys[control.right]) {
    player.x += dx
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



















































