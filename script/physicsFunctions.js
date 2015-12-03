

function checkCollision (a, b) {
  if (a === b) return false
    var a = { x: a.x, y: a.y,
              w: a.width, h: a.height}
    var b = { x: b.x, y: b.y,
              w: b.width, h: b.height}

  if (a.x + a.w > b.x - b.w && a.x - a.w < b.x + b.w) {
    if (a.y + a.h > b.y && a.y < b.y + b.h) {
      return true
    }
  }
  return false
}
